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
import { z } from "zod";

const router = Router();
const reviewSchema = z.object({ publish: z.boolean() }).strict();
const organizerSchema = z.object({ approved: z.boolean() }).strict();

router.use(requireAuth, requireRole(UserRole.ADMIN));
router.get("/dashboard", asyncHandler(adminController.dashboard));
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
router.get("/organizers", asyncHandler(userController.listOrganizers));
router.patch(
  "/organizers/:id/approval",
  validateBody(organizerSchema),
  asyncHandler(userController.approveOrganizer),
);

export default router;