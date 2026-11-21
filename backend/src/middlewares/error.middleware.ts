import { Prisma } from "@prisma/client";
import type { ErrorRequestHandler } from "express";
import multer from "multer";
import { ZodError } from "zod";
import { AppError } from "../utils/http.js";

export const errorMiddleware: ErrorRequestHandler = (
  error: unknown,
  _request,
  response,
  _next,
) => {
  if (error instanceof AppError) {
    response.status(error.status).json({
      success: false,
      error: {
        code: error.code,
        message: error.message,
        ...(error.details ? { details: error.details } : {}),
      },
    });
    return;
  }

  if (error instanceof multer.MulterError) {
    const tooLarge = error.code === "LIMIT_FILE_SIZE";
    response.status(tooLarge ? 413 : 400).json({
      success: false,
      error: {
        code: tooLarge ? "UPLOAD_TOO_LARGE" : "INVALID_UPLOAD",
        message: tooLarge ? "The uploaded file exceeds the size limit." : error.message,
      },
    });
    return;
  }

  if (error instanceof ZodError) {
    response.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Request validation failed.",
        details: error.flatten(),
      },
    });
    return;
  }

  // Type narrowing for syntax / body errors
  if (
    error instanceof SyntaxError &&
    error !== null &&
    typeof error === "object" &&
    "status" in error &&
    (error as Record<string, unknown>).status === 400
  ) {
    response.status(400).json({
      success: false,
      error: { code: "INVALID_JSON", message: "Request body must be valid JSON." },
    });
    return;
  }

  // Type narrowing for arbitrary HTTP error objects
  if (
    typeof error === "object" &&
    error !== null &&
    "status" in error
  ) {
    const statusVal = (error as Record<string, unknown>).status;
    if (typeof statusVal === "number" && statusVal >= 400 && statusVal < 500) {
      response.status(statusVal).json({
        success: false,
        error: {
          code: statusVal === 413 ? "REQUEST_TOO_LARGE" : "INVALID_REQUEST",
          message: statusVal === 413 ? "Request body exceeds the allowed size." : "Request could not be processed.",
        },
      });
      return;
    }
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2034") {
      response.status(409).json({
        success: false,
        error: {
          code: "CONCURRENT_MODIFICATION",
          message: "The resource changed concurrently. Retry the request using the same idempotency key.",
        },
      });
      return;
    }
    if (error.code === "P2002") {
      const target = (error.meta as { target?: string[] | string })?.target;
      let message = "A record with these details already exists.";
      if (Array.isArray(target)) {
        if (target.includes("email")) {
          message = "This email address is already registered.";
        } else if (target.includes("phone")) {
          message = "This phone number is already associated with an account.";
        }
      } else if (typeof target === "string") {
        if (target.includes("email")) {
          message = "This email address is already registered.";
        } else if (target.includes("phone")) {
          message = "This phone number is already associated with an account.";
        }
      }
      response.status(409).json({
        success: false,
        error: { code: "CONFLICT", message },
      });
      return;
    }
    if (error.code === "P2025") {
      response.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "The requested record was not found." },
      });
      return;
    }
  }

  console.error("Unhandled request error", error);
  response.status(500).json({
    success: false,
    error: { code: "INTERNAL_SERVER_ERROR", message: "An unexpected error occurred." },
  });
};