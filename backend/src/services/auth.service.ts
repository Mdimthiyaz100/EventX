import { createHash, randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import type { Prisma, PrismaClient, User, UserRole } from "@prisma/client";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { prisma } from "../config/database.js";
import { AppError } from "../utils/http.js";

interface TokenClaims {
  sub: string;
  role: UserRole;
  jti?: string;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  tokenType: "Bearer";
  expiresIn: number;
  user: { id: string; name: string; email: string; role: UserRole };
}

function accessExpirySeconds(): number {
  const match = /^(\d+)(s|m|h|d)$/.exec(env.JWT_ACCESS_TTL);
  if (!match) throw new Error("JWT_ACCESS_TTL must be a duration such as 15m or 1h.");
  const amount = Number(match[1]);
  const unit = match[2];
  return amount * (unit === "s" ? 1 : unit === "m" ? 60 : unit === "h" ? 3600 : 86400);
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function safeUser(user: User): AuthTokens["user"] {
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

function signAccessToken(user: Pick<User, "id" | "role">): string {
  return jwt.sign({ role: user.role }, env.JWT_ACCESS_SECRET, {
    subject: user.id,
    expiresIn: accessExpirySeconds(),
    issuer: "eventx-api",
    audience: "eventx-client",
  });
}

function signRefreshToken(user: Pick<User, "id" | "role">): string {
  return jwt.sign(
    { role: user.role, jti: randomUUID() },
    env.JWT_REFRESH_SECRET,
    {
      subject: user.id,
      expiresIn: env.JWT_REFRESH_TTL_DAYS * 86400,
      issuer: "eventx-api",
      audience: "eventx-refresh",
    },
  );
}

async function storeRefreshToken(
  token: string,
  userId: string,
  client: Pick<PrismaClient, "refreshToken"> = prisma,
): Promise<void> {
  const claims = jwt.decode(token) as jwt.JwtPayload;
  if (typeof claims.exp !== "number") throw new Error("Refresh token expiry is missing.");
  await client.refreshToken.create({
    data: {
      tokenHash: hashToken(token),
      userId,
      expiresAt: new Date(claims.exp * 1000),
    },
  });
}

async function createTokenPair(user: User): Promise<AuthTokens> {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  await storeRefreshToken(refreshToken, user.id);
  return {
    accessToken,
    refreshToken,
    tokenType: "Bearer",
    expiresIn: accessExpirySeconds(),
    user: safeUser(user),
  };
}

export async function register(input: {
  name: string;
  email: string;
  password: string;
  phone?: string;
  accountType?: "CUSTOMER" | "ORGANIZER";
}): Promise<AuthTokens> {
  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email.toLowerCase(),
      phone: input.phone,
      passwordHash: await bcrypt.hash(input.password, 12),
      role: input.accountType ?? "CUSTOMER",
    },
  });
  return createTokenPair(user);
}

export async function login(input: {
  email: string;
  password: string;
}): Promise<AuthTokens> {
  const user = await prisma.user.findUnique({
    where: { email: input.email.toLowerCase() },
  });
  if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) {
    throw new AppError(401, "INVALID_CREDENTIALS", "Email or password is incorrect.");
  }
  return createTokenPair(user);
}

export async function refresh(refreshToken: string): Promise<AuthTokens> {
  let claims: TokenClaims;
  try {
    claims = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET, {
      issuer: "eventx-api",
      audience: "eventx-refresh",
    }) as TokenClaims;
  } catch {
    throw new AppError(401, "INVALID_REFRESH_TOKEN", "Refresh token is invalid or expired.");
  }

  if (!claims.sub || !claims.jti) {
    throw new AppError(401, "INVALID_REFRESH_TOKEN", "Refresh token is invalid or expired.");
  }

  return prisma.$transaction(async (transaction) => {
    const stored = await transaction.refreshToken.findUnique({
      where: { tokenHash: hashToken(refreshToken) },
    });
    if (
      !stored ||
      stored.userId !== claims.sub ||
      stored.revokedAt ||
      stored.expiresAt <= new Date()
    ) {
      throw new AppError(401, "INVALID_REFRESH_TOKEN", "Refresh token is invalid or expired.");
    }

    const revoked = await transaction.refreshToken.updateMany({
      where: { id: stored.id, revokedAt: null, expiresAt: { gt: new Date() } },
      data: { revokedAt: new Date() },
    });
    if (revoked.count !== 1) {
      throw new AppError(401, "INVALID_REFRESH_TOKEN", "Refresh token has already been used.");
    }

    const user = await transaction.user.findUnique({ where: { id: claims.sub } });
    if (!user) {
      throw new AppError(401, "INVALID_REFRESH_TOKEN", "Refresh token is invalid or expired.");
    }

    const accessToken = signAccessToken(user);
    const nextRefreshToken = signRefreshToken(user);
    await storeRefreshToken(
      nextRefreshToken,
      user.id,
      transaction as Prisma.TransactionClient,
    );
    return {
      accessToken,
      refreshToken: nextRefreshToken,
      tokenType: "Bearer",
      expiresIn: accessExpirySeconds(),
      user: safeUser(user),
    };
  });
}

export async function logout(refreshToken: string): Promise<void> {
  await prisma.refreshToken.updateMany({
    where: { tokenHash: hashToken(refreshToken), revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

export async function getProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      createdAt: true,
    },
  });
  if (!user) throw new AppError(404, "USER_NOT_FOUND", "User not found.");
  return user;
}

export async function updateProfile(
  userId: string,
  input: { name?: string; phone?: string | null },
) {
  return prisma.user.update({
    where: { id: userId },
    data: input,
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      createdAt: true,
    },
  });
}

export function verifyAccessToken(token: string): TokenClaims {
  return jwt.verify(token, env.JWT_ACCESS_SECRET, {
    issuer: "eventx-api",
    audience: "eventx-client",
  }) as TokenClaims;
}