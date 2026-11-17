import { Router } from "express";
import { UserRole } from "@prisma/client";
import * as adminController from "../controllers/admin.controller.js";
import * as userController from "../controllers/user.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import { validateBody } from "../middlewares/validation.middleware.js";
import { asyncHandler } from "../utils/http.js";
import { validateQuery } from "../middlewares/validation.middleware.js";
import { transactionQuerySchema } from "../validators/admin.validator.js";
import { createEventSchema, updateEventSchema } from "../validators/event.validator.js";
import { z } from "zod";

const router = Router();
const reviewSchema = z.object({ publish: z.boolean() }).strict();
const organizerSchema = z.object({ approved: z.boolean() }).strict();

router.use(requireAuth, requireRole(UserRole.ADMIN));
router.get("/dashboard", asyncHandler(adminController.dashboard));
router.get("/events", validateQuery(z.object({ page: z.coerce.number().int().min(1).default(1), limit: z.coerce.number().int().min(1).max(100).default(20), search: z.string().trim().max(100).optional(), status: z.string().trim().max(30).optional(), category: z.string().trim().max(80).optional() })), asyncHandler(adminController.events));
router.get("/bookings", validateQuery(z.object({ page: z.coerce.number().int().min(1).default(1), limit: z.coerce.number().int().min(1).max(100).default(20), search: z.string().trim().max(100).optional(), status: z.string().trim().max(30).optional() })), asyncHandler(adminController.bookings));
router.get("/users", validateQuery(z.object({ page: z.coerce.number().int().min(1).default(1), limit: z.coerce.number().int().min(1).max(100).default(20), search: z.string().trim().max(100).optional(), role: z.enum(["CUSTOMER", "ORGANIZER", "ADMIN"]).optional() })), asyncHandler(adminController.users));
router.get("/categories", asyncHandler(adminController.categories));
router.get("/events/pending", asyncHandler(adminController.pendingEvents));
router.get(
  "/transactions",
  validateQuery(transactionQuerySchema),
  asyncHandler(adminController.transactions),
);
router.patch(
  "/events/:id/review",
  validateBody(reviewSchema),
  asyncHandler(adminController.reviewEvent),
);
router.post(
  "/events",
  validateBody(createEventSchema),
  asyncHandler(adminController.createEvent),
);
router.get("/events/:id", asyncHandler(adminController.getEvent));
router.put(
  "/events/:id",
  validateBody(updateEventSchema),
  asyncHandler(adminController.updateEvent),
);
router.delete("/events/:id", asyncHandler(adminController.deleteEvent));
router.get("/organizers", asyncHandler(userController.listOrganizers));
router.patch(
  "/organizers/:id/approval",
  validateBody(organizerSchema),
  asyncHandler(userController.approveOrganizer),
);

export default router;
