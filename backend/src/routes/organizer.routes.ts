import { Router } from "express";
import * as bookingController from "../controllers/booking.controller.js";
import * as eventController from "../controllers/event.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { requireApprovedOrganizer } from "../middlewares/role.middleware.js";
import { imageUpload } from "../middlewares/upload.middleware.js";
import { validateBody } from "../middlewares/validation.middleware.js";
import { asyncHandler } from "../utils/http.js";
import { z } from "zod";

const router = Router();
router.use(requireAuth, requireApprovedOrganizer);

router.post(
  "/events/images",
  imageUpload.single("image"),
  asyncHandler(eventController.uploadImage),
);
router.get(
  "/events/:eventId/attendees",
  asyncHandler(bookingController.attendees),
);
router.post(
  "/events/:eventId/check-in",
  validateBody(z.object({ qrToken: z.string().min(32).max(100) }).strict()),
  asyncHandler(bookingController.checkIn),
);

export default router;