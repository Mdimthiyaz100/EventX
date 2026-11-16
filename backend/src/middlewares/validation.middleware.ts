import type { RequestHandler } from "express";
import type { ZodType } from "zod";
import { AppError } from "../utils/http.js";

export function validateBody(schema: ZodType): RequestHandler {
  return (request, _response, next) => {
    const result = schema.safeParse(request.body);
    if (!result.success) {
      next(
        new AppError(400, "VALIDATION_ERROR", "Request validation failed.", result.error.flatten()),
      );
      return;
    }
    request.body = result.data;
    next();
  };
}

export function validateQuery(schema: ZodType): RequestHandler {
  return (request, _response, next) => {
    const result = schema.safeParse(request.query);
    if (!result.success) {
      next(
        new AppError(400, "VALIDATION_ERROR", "Query validation failed.", result.error.flatten()),
      );
      return;
    }
    Object.assign(request.query, result.data);
    next();
  };
}