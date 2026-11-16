import "dotenv/config";
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";
import { env } from "./config/env.js";
import { prisma } from "./config/database.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import { asyncHandler, AppError, sendData } from "./utils/http.js";
import authRoutes from "./routes/auth.routes.js";
import eventRoutes from "./routes/event.routes.js";
import bookingRoutes from "./routes/booking.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import organizerRoutes from "./routes/organizer.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import * as paymentController from "./controllers/payment.controller.js";
import { expireStaleBookings } from "./jobs/booking-expiration.job.js";

const app = express();
const openApiDocument = {
  openapi: "3.0.3",
  info: {
    title: "EventX API",
    version: "1.0.0",
    description: "REST API for EventX events, bookings, tickets and payments.",
  },
  servers: [{ url: "/api" }],
  components: {
    securitySchemes: {
      bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
    },
    schemas: {
      SuccessResponse: {
        type: "object",
        required: ["success", "data"],
        properties: { success: { type: "boolean", example: true }, data: {} },
      },
      ErrorResponse: {
        type: "object",
        required: ["success", "error"],
        properties: {
          success: { type: "boolean", example: false },
          error: {
            type: "object",
            required: ["code", "message"],
            properties: {
              code: { type: "string" },
              message: { type: "string" },
            },
          },
        },
      },
    },
  },
  paths: {
    "/health": {
      get: {
        summary: "Health check",
        responses: { "200": { description: "API is available" } },
      },
    },
    "/auth/register": {
      post: {
        summary: "Register a customer or unapproved organizer",
        responses: {
          "201": { description: "Account created" },
          "400": { description: "Validation error" },
          "409": { description: "Email already registered" },
        },
      },
    },
    "/auth/login": {
      post: {
        summary: "Sign in",
        responses: {
          "200": { description: "Tokens issued" },
          "401": { description: "Invalid credentials" },
        },
      },
    },
    "/auth/refresh": {
      post: {
        summary: "Rotate a refresh token",
        responses: { "200": { description: "Tokens rotated" } },
      },
    },
    "/events": {
      get: {
        summary: "Search and paginate published events",
        parameters: [
          { in: "query", name: "page", schema: { type: "integer", minimum: 1 } },
          { in: "query", name: "limit", schema: { type: "integer", maximum: 50 } },
          { in: "query", name: "search", schema: { type: "string" } },
          { in: "query", name: "city", schema: { type: "string" } },
          { in: "query", name: "category", schema: { type: "string" } },
        ],
        responses: { "200": { description: "Event results and pagination metadata" } },
      },
    },
    "/bookings": {
      post: {
        summary: "Reserve tickets; provide an Idempotency-Key header",
        security: [{ bearerAuth: [] }],
        responses: {
          "201": { description: "Booking created" },
          "409": { description: "Tickets unavailable" },
        },
      },
    },
    "/payments/links": {
      post: {
        summary: "Create an expiring payment link for the authenticated booking owner",
        security: [{ bearerAuth: [] }],
        responses: { "201": { description: "Payment link created" } },
      },
    },
    "/payments/webhook": {
      post: {
        summary: "Verified Razorpay payment-link webhook",
        description:
          "Requires x-razorpay-signature and x-razorpay-event-id headers. The HMAC is checked against the exact raw request body. Handles payment_link.paid, payment_link.expired, and payment_link.cancelled.",
        responses: {
          "200": { description: "Webhook accepted or duplicate ignored" },
          "401": { description: "Invalid webhook signature" },
        },
      },
    },
    "/organizer/events/{eventId}/check-in": {
      post: {
        summary: "Validate and check in a ticket exactly once",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Ticket checked in" },
          "409": { description: "Ticket already checked in" },
        },
      },
    },
    "/admin/transactions": {
      get: {
        summary: "Paginated payment monitoring for administrators",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "query",
            name: "status",
            schema: {
              type: "string",
              enum: ["PENDING", "PAID", "FAILED", "REFUNDED"],
            },
          },
        ],
        responses: {
          "200": { description: "Payments and pagination metadata" },
          "403": { description: "Admin role required" },
        },
      },
    },
  },
};

app.disable("x-powered-by");
app.use(helmet());
app.use(cors({ origin: env.CLIENT_ORIGIN, credentials: true }));

app.post(
  "/api/payments/webhook",
  express.raw({ type: "application/json", limit: "1mb" }),
  asyncHandler(paymentController.webhook),
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false, limit: "1mb" }));

app.get(
  "/api/health",
  asyncHandler(async (_request, response) => {
    await prisma.$queryRaw`SELECT 1`;
    sendData(response, { status: "ok" });
  }),
);
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));
app.use("/uploads", express.static(resolve(process.cwd(), env.UPLOAD_DIR), {
  dotfiles: "deny",
  index: false,
  maxAge: "1d",
  immutable: false,
}));
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/organizer", organizerRoutes);
app.use("/api/admin", adminRoutes);
app.use((_request, _response, next) => {
  next(new AppError(404, "NOT_FOUND", "Route not found."));
});
app.use(errorMiddleware);

async function start(): Promise<void> {
  await mkdir(resolve(process.cwd(), env.UPLOAD_DIR), { recursive: true });
  await prisma.$connect();
  const server = app.listen(env.PORT, () => {
    console.info(`EventX API listening on port ${env.PORT}`);
  });
  const expirationTimer = setInterval(() => {
    void expireStaleBookings().catch((error: unknown) => {
      console.error("Failed to expire stale bookings", error);
    });
  }, 30_000);
  expirationTimer.unref();

  const shutdown = (signal: string) => {
    console.info(`${signal} received; shutting down.`);
    clearInterval(expirationTimer);
    server.close(() => {
      void prisma.$disconnect().then(() => process.exit(0));
    });
  };
  process.once("SIGINT", () => shutdown("SIGINT"));
  process.once("SIGTERM", () => shutdown("SIGTERM"));
}

start().catch(async (error: unknown) => {
  console.error("Failed to start EventX API", error);
  await prisma.$disconnect();
  process.exitCode = 1;
});