import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import * as authController from "../controllers/auth.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { validateBody } from "../middlewares/validation.middleware.js";
import { asyncHandler } from "../utils/http.js";
import {
  loginSchema,
  profileSchema,
  refreshSchema,
  registerSchema,
} from "../validators/auth.validator.js";

const router = Router();
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/register", authLimiter, validateBody(registerSchema), asyncHandler(authController.register));
router.post("/login", authLimiter, validateBody(loginSchema), asyncHandler(authController.login));
router.post("/refresh", authLimiter, validateBody(refreshSchema), asyncHandler(authController.refresh));
router.post("/logout", validateBody(refreshSchema), asyncHandler(authController.logout));
router.get("/me", requireAuth, asyncHandler(authController.me));
router.patch(
  "/me",
  requireAuth,
  validateBody(profileSchema),
  asyncHandler(authController.updateMe),
);

export default router;