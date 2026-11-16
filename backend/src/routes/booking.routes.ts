import { Router } from "express";
import { UserRole } from "@prisma/client";
import * as bookingController from "../controllers/booking.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import { validateBody } from "../middlewares/validation.middleware.js";
import { asyncHandler } from "../utils/http.js";
import { createBookingSchema } from "../validators/booking.validator.js";

const router = Router();

router.use(requireAuth);
router.post(
  "/",
  requireRole(UserRole.CUSTOMER),
  validateBody(createBookingSchema),
  asyncHandler(bookingController.create),
);
router.get("/mine", requireRole(UserRole.CUSTOMER), asyncHandler(bookingController.listMine));
router.post(
  "/:id/cancel",
  requireRole(UserRole.CUSTOMER),
  asyncHandler(bookingController.cancel),
);
export default router;