import "dotenv/config";
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";
import { env } from "./config/env.js";
import { prisma } from "./config/database.js";
import { pool, testDatabaseConnection } from "./config/mysql.js";
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
import { adminMovieRouter, publicMovieRouter } from "./routes/movie.routes.js";

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
    "/movies": {
      get: {
        summary: "Search and paginate published movies",
        parameters: [
          { in: "query", name: "page", schema: { type: "integer", minimum: 1 } },
          { in: "query", name: "limit", schema: { type: "integer", maximum: 50 } },
          { in: "query", name: "search", schema: { type: "string" } },
          { in: "query", name: "language", schema: { type: "string" } },
          { in: "query", name: "genre", schema: { type: "string" } },
        ],
        responses: { "200": { description: "Published movies and pagination" } },
      },
    },
    "/movies/{slug}": {
      get: { summary: "Read published movie details", responses: { "200": { description: "Published movie" }, "404": { description: "Movie not found" } } },
    },
    "/admin/movies": {
      get: {
        summary: "Search and paginate movies for administrators",
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: "query", name: "page", schema: { type: "integer", minimum: 1 } },
          { in: "query", name: "limit", schema: { type: "integer", maximum: 50 } },
          { in: "query", name: "search", schema: { type: "string" } },
          { in: "query", name: "language", schema: { type: "string" } },
          { in: "query", name: "genre", schema: { type: "string" } },
          { in: "query", name: "status", schema: { type: "string", enum: ["DRAFT", "PUBLISHED", "ARCHIVED"] } },
        ],
        responses: { "200": { description: "Movies and pagination" }, "401": { description: "Authentication required" }, "403": { description: "Administrator role required" } },
      },
      post: {
        summary: "Create a movie",
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["title", "description", "language", "genre", "duration", "certification", "releaseDate", "posterUrl", "director", "cast"], additionalProperties: false, properties: { title: { type: "string" }, description: { type: "string" }, language: { type: "string" }, genre: { type: "string" }, duration: { type: "integer" }, certification: { type: "string", enum: ["U", "UA", "A"] }, releaseDate: { type: "string", format: "date" }, posterUrl: { type: "string", format: "uri" }, bannerUrl: { type: "string", format: "uri", nullable: true }, trailerUrl: { type: "string", format: "uri", nullable: true }, director: { type: "string" }, cast: { type: "string" }, status: { type: "string", enum: ["DRAFT", "PUBLISHED", "ARCHIVED"] }, featured: { type: "boolean" } } } } } },
        responses: { "201": { description: "Movie created" }, "400": { description: "Validation failed" } },
      },
    },
    "/admin/movies/{id}": {
      get: { summary: "Read a movie for administrators", security: [{ bearerAuth: [] }], responses: { "200": { description: "Movie details" }, "404": { description: "Movie not found" } } },
      put: { summary: "Update movie metadata", security: [{ bearerAuth: [] }], responses: { "200": { description: "Movie updated" } } },
      delete: { summary: "Delete a movie and clean up unreferenced images", security: [{ bearerAuth: [] }], responses: { "200": { description: "Movie deleted" } } },
    },
    "/admin/movies/{id}/status": {
      patch: { summary: "Change movie publication status", security: [{ bearerAuth: [] }], requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["status"], properties: { status: { type: "string", enum: ["DRAFT", "PUBLISHED", "ARCHIVED"] } } } } } }, responses: { "200": { description: "Movie status updated" } } },
    },
    "/admin/movies/images": {
      post: { summary: "Upload a movie poster or banner to Cloudinary", security: [{ bearerAuth: [] }], parameters: [{ in: "query", name: "kind", required: true, schema: { type: "string", enum: ["poster", "banner"] } }], requestBody: { required: true, content: { "multipart/form-data": { schema: { type: "object", required: ["image"], properties: { image: { type: "string", format: "binary" } } } } } }, responses: { "201": { description: "Uploaded secure URL" }, "413": { description: "Image exceeds size limit" } } },
    },
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

app.get(
  "/api/health/db",
  async (_request, response) => {
    try {
      const { database } = await testDatabaseConnection();
      return response.status(200).json({
        success: true,
        message: "Database connected successfully",
        database,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Database connection failed";
      console.error("Health check database failure:", message);
      return response.status(500).json({
        success: false,
        message: "Database connection failed",
      });
    }
  },
);
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));
app.use("/uploads", express.static(resolve(process.cwd(), env.UPLOAD_DIR), {
  dotfiles: "deny",
  index: false,
  maxAge: "1d",
  immutable: false,
}));
app.get(
  "/api/categories",
  asyncHandler(async (_request, response) => {
    const rawCategories = await prisma.event.findMany({
      where: { status: "PUBLISHED" },
      select: { category: true },
      distinct: ["category"],
    });
    const categories = rawCategories.map((c) => c.category).filter(Boolean);
    sendData(response, categories);
  }),
);

app.use("/api/auth", authRoutes);
app.use("/api/movies", publicMovieRouter);
app.use("/api/admin/movies", adminMovieRouter);
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
  
  // Verify MySQL connection pool
  try {
    const { database } = await testDatabaseConnection();
    console.info(`Connected to Aiven MySQL database: ${database}`);
  } catch (dbError: unknown) {
    const msg = dbError instanceof Error ? dbError.message : String(dbError);
    console.error(`Failed to connect to Aiven MySQL pool: ${msg}`);
  }

  await prisma.$connect();
  // Prisma connection diagnostic
const prismaUrl = new URL(env.DATABASE_URL);

console.log("Prisma connection diagnostic:", {
  hostname: prismaUrl.hostname,
  port: prismaUrl.port,
  database: prismaUrl.pathname,
  username: decodeURIComponent(prismaUrl.username),
  passwordPresent: Boolean(prismaUrl.password),
  passwordLength: decodeURIComponent(prismaUrl.password).length,
});

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
      void Promise.all([
        prisma.$disconnect(),
        pool.end(),
      ]).then(() => process.exit(0));
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
