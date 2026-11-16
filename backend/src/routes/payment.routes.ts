import { Router } from "express";
import { UserRole } from "@prisma/client";
import * as paymentController from "../controllers/payment.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import { validateBody } from "../middlewares/validation.middleware.js";
import { asyncHandler } from "../utils/http.js";
import { z } from "zod";

const router = Router();
const orderSchema = z.object({ bookingId: z.string().min(1).max(64) }).strict();

router.post(
  "/links",
  requireAuth,
  requireRole(UserRole.CUSTOMER),
  validateBody(orderSchema),
  asyncHandler(paymentController.createPaymentLink),
);
export default router;