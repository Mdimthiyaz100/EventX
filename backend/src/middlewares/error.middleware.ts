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

  if (
    error instanceof SyntaxError &&
    "status" in error &&
    error.status === 400
  ) {
    response.status(400).json({
      success: false,
      error: { code: "INVALID_JSON", message: "Request body must be valid JSON." },
    });
    return;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    typeof error.status === "number" &&
    error.status >= 400 &&
    error.status < 500
  ) {
    response.status(error.status).json({
      success: false,
      error: {
        code: error.status === 413 ? "REQUEST_TOO_LARGE" : "INVALID_REQUEST",
        message: error.status === 413 ? "Request body exceeds the allowed size." : "Request could not be processed.",
      },
    });
    return;
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
      response.status(409).json({
        success: false,
        error: { code: "CONFLICT", message: "A record with these details already exists." },
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