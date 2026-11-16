import type { Request, RequestHandler, Response } from "express";

export class AppError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function asyncHandler(
  handler: RequestHandler,
): RequestHandler {
  return (request, response, next) => {
    void Promise.resolve(handler(request, response, next)).catch(next);
  };
}

export function routeParam(value: string | undefined, name: string): string {
  if (!value) throw new AppError(400, "INVALID_ROUTE_PARAMETER", `Missing route parameter: ${name}.`);
  return value;
}

export function sendData(
  response: Response,
  data: unknown,
  status = 200,
  meta?: Record<string, unknown>,
): void {
  response.status(status).json({
    success: true,
    data,
    ...(meta ? { meta } : {}),
  });
}
