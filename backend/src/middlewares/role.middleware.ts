import type { RequestHandler } from "express";
import { UserRole } from "@prisma/client";
import { prisma } from "../config/database.js";
import { AppError } from "../utils/http.js";

export function requireRole(...roles: UserRole[]): RequestHandler {
  return (request, _response, next) => {
    if (!request.auth) {
      next(new AppError(401, "AUTHENTICATION_REQUIRED", "Authentication is required."));
      return;
    }
    if (!roles.includes(request.auth.role)) {
      next(new AppError(403, "FORBIDDEN", "You do not have permission to perform this action."));
      return;
    }
    next();
  };
}

export const requireApprovedOrganizer: RequestHandler = (
  request,
  _response,
  next,
) => {
  if (!request.auth) {
    next(new AppError(401, "AUTHENTICATION_REQUIRED", "Authentication is required."));
    return;
  }
  if (request.auth.role !== UserRole.ORGANIZER) {
    next(new AppError(403, "FORBIDDEN", "Organizer access is required."));
    return;
  }

  void prisma.user
    .findUnique({
      where: { id: request.auth.userId },
      select: { role: true, organizerApproved: true },
    })
    .then((user) => {
      if (user?.role !== UserRole.ORGANIZER || !user.organizerApproved) {
        next(
          new AppError(
            403,
            "ORGANIZER_NOT_APPROVED",
            "An approved organizer account is required.",
          ),
        );
        return;
      }
      next();
    })
    .catch(next);
};