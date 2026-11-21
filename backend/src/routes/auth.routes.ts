import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import * as authController from "../controllers/auth.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { validateBody } from "../middlewares/validation.middleware.js";
import { asyncHandler } from "../utils/http.js";
import {
  forgotPasswordInitiateSchema,
  loginSchema,
  organizerLoginSchema,
  organizerRegisterSchema,
  profileSchema,
  refreshSchema,
  registerSchema,
  resetPasswordSecuritySchema,
  setupSecurityQuestionsSchema,
  verifySecurityAnswersSchema,
} from "../validators/auth.validator.js";

const router = Router();
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

const recoveryLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 15,
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/register", authLimiter, validateBody(registerSchema), asyncHandler(authController.register));
router.post("/login", authLimiter, validateBody(loginSchema), asyncHandler(authController.login));

// Dedicated Organizer Authentication Endpoints
router.post(
  "/organizer/register",
  authLimiter,
  validateBody(organizerRegisterSchema),
  asyncHandler(authController.registerOrganizer),
);
router.post(
  "/organizer/login",
  authLimiter,
  validateBody(organizerLoginSchema),
  asyncHandler(authController.loginOrganizer),
);
router.post("/refresh", authLimiter, validateBody(refreshSchema), asyncHandler(authController.refresh));
router.post("/logout", validateBody(refreshSchema), asyncHandler(authController.logout));
router.get("/me", requireAuth, asyncHandler(authController.me));
router.patch(
  "/me",
  requireAuth,
  validateBody(profileSchema),
  asyncHandler(authController.updateMe),
);

// Security Questions Management for Authenticated Users
router.get("/security-questions", requireAuth, asyncHandler(authController.getSecurityQuestions));
router.get("/security-status", requireAuth, asyncHandler(authController.getSecurityStatus));
router.post(
  "/setup-security-questions",
  requireAuth,
  validateBody(setupSecurityQuestionsSchema),
  asyncHandler(authController.setupSecurityQuestions),
);
router.put(
  "/update-security-questions",
  requireAuth,
  validateBody(setupSecurityQuestionsSchema),
  asyncHandler(authController.setupSecurityQuestions),
);

// Password Recovery with Security Questions (Public / Unauthenticated)
router.post(
  "/forgot-password",
  recoveryLimiter,
  validateBody(forgotPasswordInitiateSchema),
  asyncHandler(authController.forgotPassword),
);
router.post(
  "/verify-security-answers",
  recoveryLimiter,
  validateBody(verifySecurityAnswersSchema),
  asyncHandler(authController.verifySecurityAnswers),
);
router.post(
  "/reset-password-security",
  recoveryLimiter,
  validateBody(resetPasswordSecuritySchema),
  asyncHandler(authController.resetPasswordSecurity),
);

export default router;
