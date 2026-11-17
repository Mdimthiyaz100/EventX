import { Router } from "express";
import * as movieController from "../controllers/movie.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import { imageUpload } from "../middlewares/upload.middleware.js";
import { asyncHandler } from "../utils/http.js";
import { UserRole } from "@prisma/client";
import { validateBody, validateQuery } from "../middlewares/validation.middleware.js";
import { createMovieSchema, movieImageQuerySchema, movieStatusSchema, updateMovieSchema, movieListQuerySchema } from "../validators/movie.validator.js";

export const publicMovieRouter = Router();
publicMovieRouter.get("/", validateQuery(movieListQuerySchema), asyncHandler(movieController.publicList));
publicMovieRouter.get("/:slug", asyncHandler(movieController.publicGet));

export const adminMovieRouter = Router();
adminMovieRouter.use(requireAuth, requireRole(UserRole.ADMIN));
adminMovieRouter.get("/", validateQuery(movieListQuerySchema), asyncHandler(movieController.adminList));
adminMovieRouter.get("/:id", asyncHandler(movieController.adminGet));
adminMovieRouter.post("/images", validateQuery(movieImageQuerySchema), imageUpload.single("image"), asyncHandler(movieController.uploadImage));
adminMovieRouter.post("/", validateBody(createMovieSchema), asyncHandler(movieController.create));
adminMovieRouter.put("/:id", validateBody(updateMovieSchema), asyncHandler(movieController.update));
adminMovieRouter.patch("/:id/status", validateBody(movieStatusSchema), asyncHandler(movieController.changeStatus));
adminMovieRouter.delete("/:id", asyncHandler(movieController.remove));
