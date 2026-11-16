import type { RequestHandler } from "express";
import { UserRole } from "@prisma/client";
import { AppError } from "../utils/http.js";
import { verifyAccessToken } from "../services/auth.service.js";

export const requireAuth: RequestHandler = (request, _response, next) => {
  const authorization = request.header("authorization");
  if (!authorization?.startsWith("Bearer ")) {
    next(new AppError(401, "AUTHENTICATION_REQUIRED", "A bearer access token is required."));
    return;
  }

  try {
    const claims = verifyAccessToken(authorization.slice(7));
    if (!claims.sub || !Object.values(UserRole).includes(claims.role)) {
      throw new Error("Invalid token claims.");
    }
    request.auth = { userId: claims.sub, role: claims.role };
    next();
  } catch {
    next(new AppError(401, "INVALID_ACCESS_TOKEN", "Access token is invalid or expired."));
  }
};