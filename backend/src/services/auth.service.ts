import { createHash, randomBytes, randomUUID } from "node:crypto";
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
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    organizerCategory?: string;
  };
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

function parseCategoryFromName(fullName: string): string {
  const match = /\[(.*?)\]/.exec(fullName);
  return match && match[1] ? match[1].trim() : "General Events";
}

function safeUser(user: User): AuthTokens["user"] {
  const organizerCategory = user.role === "ORGANIZER" ? parseCategoryFromName(user.name) : undefined;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    ...(organizerCategory ? { organizerCategory } : {}),
  };
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
  const normalizedEmail = input.email.toLowerCase().trim();
  const existingEmail = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });
  if (existingEmail) {
    throw new AppError(409, "EMAIL_ALREADY_EXISTS", "This email address is already registered.");
  }

  const normalizedPhone = input.phone?.trim() ? input.phone.trim() : null;
  if (normalizedPhone) {
    const existingPhone = await prisma.user.findUnique({
      where: { phone: normalizedPhone },
    });
    if (existingPhone) {
      throw new AppError(409, "PHONE_ALREADY_EXISTS", "This phone number is already associated with an account.");
    }
  }

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: normalizedEmail,
      phone: normalizedPhone,
      passwordHash: await bcrypt.hash(input.password, 12),
      role: input.accountType ?? "CUSTOMER",
      organizerApproved: false,
    },
  });
  return createTokenPair(user);
}

export async function registerOrganizer(input: {
  organizerCategory: string;
  contactName: string;
  organizationName: string;
  email: string;
  phone: string;
  password: string;
}) {
  const normalizedEmail = input.email.toLowerCase().trim();
  const existingEmail = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });
  if (existingEmail) {
    throw new AppError(409, "EMAIL_ALREADY_EXISTS", "This email address is already registered.");
  }

  const normalizedPhone = input.phone.trim();
  const existingPhone = await prisma.user.findUnique({
    where: { phone: normalizedPhone },
  });
  if (existingPhone) {
    throw new AppError(409, "PHONE_ALREADY_EXISTS", "This phone number is already associated with an account.");
  }

  // Construct composite organization profile in user name: "Organization Name (Contact Name) [Category]"
  const compositeName = `${input.organizationName} (${input.contactName}) [${input.organizerCategory}]`;

  const user = await prisma.user.create({
    data: {
      name: compositeName,
      email: normalizedEmail,
      phone: normalizedPhone,
      passwordHash: await bcrypt.hash(input.password, 12),
      role: "ORGANIZER",
      organizerApproved: false,
    },
  });

  return {
    id: user.id,
    name: user.name,
    organizationName: input.organizationName,
    contactName: input.contactName,
    organizerCategory: input.organizerCategory,
    email: user.email,
    phone: user.phone,
    role: user.role,
    status: "PENDING",
    organizerApproved: false,
    message: "Your organizer application has been submitted successfully and is pending administrator approval.",
  };
}

export async function loginOrganizer(input: {
  email: string;
  password: string;
}): Promise<AuthTokens & { organizerStatus: "APPROVED" | "PENDING" }> {
  const normalizedEmail = input.email.toLowerCase().trim();
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) {
    throw new AppError(401, "INVALID_CREDENTIALS", "Email or password is incorrect.");
  }

  if (user.role !== "ORGANIZER" && user.role !== "ADMIN") {
    throw new AppError(403, "NOT_AN_ORGANIZER", "This account is not registered as an organizer.");
  }

  if (!user.organizerApproved && user.role !== "ADMIN") {
    throw new AppError(
      403,
      "APPLICATION_PENDING",
      "Your organizer account is pending administrator approval. Please wait for review before signing in.",
    );
  }

  const tokens = await createTokenPair(user);
  return {
    ...tokens,
    organizerStatus: user.organizerApproved ? "APPROVED" : "PENDING",
  };
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
  const organizerCategory = user.role === "ORGANIZER" ? parseCategoryFromName(user.name) : undefined;
  return {
    ...user,
    ...(organizerCategory ? { organizerCategory } : {}),
  };
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

export function normalizeSecurityAnswer(answer: string): string {
  return answer.trim().toLowerCase().replace(/\s+/g, " ");
}

export async function getActiveSecurityQuestions() {
  return prisma.securityQuestion.findMany({
    where: { isActive: true },
    select: {
      id: true,
      question: true,
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function getUserSecurityStatus(userId: string) {
  const count = await prisma.userSecurityAnswer.count({ where: { userId } });
  return { hasSecurityQuestions: count >= 3, count };
}

export async function setupUserSecurityQuestions(
  userId: string,
  answers: Array<{ questionId: string; answer: string }>,
) {
  const questionIds = answers.map((a) => a.questionId);
  const validQuestions = await prisma.securityQuestion.findMany({
    where: { id: { in: questionIds }, isActive: true },
    select: { id: true },
  });

  if (validQuestions.length !== 3) {
    throw new AppError(400, "INVALID_QUESTIONS", "One or more selected security questions are invalid or inactive.");
  }

  const hashedData = await Promise.all(
    answers.map(async (item) => ({
      userId,
      questionId: item.questionId,
      answerHash: await bcrypt.hash(normalizeSecurityAnswer(item.answer), 12),
    })),
  );

  await prisma.$transaction(async (tx) => {
    await tx.userSecurityAnswer.deleteMany({ where: { userId } });
    await tx.userSecurityAnswer.createMany({ data: hashedData });
  });

  return { success: true, message: "Security questions configured successfully." };
}

export async function forgotPasswordInitiate(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: {
      id: true,
      securityAnswers: {
        select: {
          questionId: true,
          question: {
            select: {
              id: true,
              question: true,
            },
          },
        },
      },
    },
  });

  // Security: If user does not exist or has not configured 3 security questions,
  // return a success response without leaking user existence.
  if (!user || user.securityAnswers.length < 3) {
    return {
      hasQuestions: false,
      questions: [],
    };
  }

  return {
    hasQuestions: true,
    questions: user.securityAnswers.map((sa) => ({
      questionId: sa.question.id,
      question: sa.question.question,
    })),
  };
}

export async function verifySecurityAnswers(
  email: string,
  submittedAnswers: Array<{ questionId: string; answer: string }>,
) {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    include: {
      securityAnswers: true,
      recoveryAttempts: true,
    },
  });

  // Generic rejection if account not found or questions not configured
  if (!user || user.securityAnswers.length < 3) {
    throw new AppError(400, "VERIFICATION_FAILED", "Invalid security answers or user not eligible for security recovery.");
  }

  const now = new Date();
  let attemptRecord = user.recoveryAttempts;

  if (attemptRecord?.lockedUntil && attemptRecord.lockedUntil > now) {
    const minutesLeft = Math.ceil((attemptRecord.lockedUntil.getTime() - now.getTime()) / 60000);
    throw new AppError(
      429,
      "ACCOUNT_LOCKED",
      `Too many failed attempts. Security question recovery is locked. Try again in ${minutesLeft} minutes.`,
    );
  }

  // Map answers
  const storedAnswersMap = new Map(user.securityAnswers.map((sa) => [sa.questionId, sa.answerHash]));

  let allMatch = submittedAnswers.length === 3;
  if (allMatch) {
    for (const item of submittedAnswers) {
      const storedHash = storedAnswersMap.get(item.questionId);
      if (!storedHash) {
        allMatch = false;
        break;
      }
      const matches = await bcrypt.compare(normalizeSecurityAnswer(item.answer), storedHash);
      if (!matches) {
        allMatch = false;
        break;
      }
    }
  }

  if (!allMatch) {
    // Increment failed attempts
    const newCount = (attemptRecord?.failedAttempts || 0) + 1;
    const shouldLock = newCount >= 5;
    const lockedUntil = shouldLock ? new Date(Date.now() + 15 * 60 * 1000) : null;

    await prisma.passwordRecoveryAttempt.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        failedAttempts: newCount,
        lockedUntil,
      },
      update: {
        failedAttempts: newCount,
        lockedUntil,
      },
    });

    if (shouldLock) {
      throw new AppError(
        429,
        "MAX_ATTEMPTS_EXCEEDED",
        "Maximum verification attempts exceeded (5/5). Account recovery locked for 15 minutes.",
      );
    }

    const remaining = 5 - newCount;
    throw new AppError(
      400,
      "INCORRECT_ANSWERS",
      `One or more answers are incorrect. You have ${remaining} ${remaining === 1 ? "attempt" : "attempts"} remaining.`,
    );
  }

  // Verification succeeded - reset failure counter & generate single-use recovery token
  await prisma.passwordRecoveryAttempt.upsert({
    where: { userId: user.id },
    create: { userId: user.id, failedAttempts: 0, lockedUntil: null },
    update: { failedAttempts: 0, lockedUntil: null },
  });

  const rawRecoveryToken = randomBytes(32).toString("hex");
  const hashedRecoveryToken = hashToken(rawRecoveryToken);
  const tokenExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash: hashedRecoveryToken,
      expiresAt: tokenExpiry,
    },
  });

  return {
    verified: true,
    recoveryToken: rawRecoveryToken,
    expiresIn: 600,
  };
}

export async function resetPasswordWithSecurityToken(rawRecoveryToken: string, newPassword: string) {
  const tokenHash = hashToken(rawRecoveryToken);
  const now = new Date();

  const tokenRecord = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (!tokenRecord) {
    throw new AppError(400, "INVALID_TOKEN", "Recovery token is invalid or has expired.");
  }

  if (tokenRecord.usedAt !== null) {
    throw new AppError(400, "TOKEN_ALREADY_USED", "This recovery token has already been used.");
  }

  if (tokenRecord.expiresAt < now) {
    throw new AppError(400, "TOKEN_EXPIRED", "This recovery token has expired. Please restart password recovery.");
  }

  const newHash = await bcrypt.hash(newPassword, 12);

  await prisma.$transaction(async (tx) => {
    // 1. Mark recovery token as used
    await tx.passwordResetToken.update({
      where: { id: tokenRecord.id },
      data: { usedAt: now },
    });

    // 2. Invalidate all other recovery tokens for this user
    await tx.passwordResetToken.updateMany({
      where: { userId: tokenRecord.userId, usedAt: null },
      data: { usedAt: now },
    });

    // 3. Invalidate all existing refresh tokens (sessions)
    await tx.refreshToken.updateMany({
      where: { userId: tokenRecord.userId, revokedAt: null },
      data: { revokedAt: now },
    });

    // 4. Update password
    await tx.user.update({
      where: { id: tokenRecord.userId },
      data: { passwordHash: newHash },
    });
  });

  return {
    success: true,
    message: "Password has been reset successfully. Please sign in with your new credentials.",
  };
}
