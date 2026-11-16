import { Router } from "express";
import * as eventController from "../controllers/event.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { requireApprovedOrganizer } from "../middlewares/role.middleware.js";
import { validateBody, validateQuery } from "../middlewares/validation.middleware.js";
import { asyncHandler } from "../utils/http.js";
import {
  createEventSchema,
  eventListQuerySchema,
  updateEventSchema,
} from "../validators/event.validator.js";

const router = Router();

router.get("/", validateQuery(eventListQuerySchema), asyncHandler(eventController.list));
router.get("/:id", asyncHandler(eventController.getById));
router.post(
  "/",
  requireAuth,
  requireApprovedOrganizer,
  validateBody(createEventSchema),
  asyncHandler(eventController.create),
);
router.get(
  "/organizer/mine",
  requireAuth,
  requireApprovedOrganizer,
  asyncHandler(eventController.organizerList),
);
router.patch(
  "/:id",
  requireAuth,
  requireApprovedOrganizer,
  validateBody(updateEventSchema),
  asyncHandler(eventController.update),
);

export default router;