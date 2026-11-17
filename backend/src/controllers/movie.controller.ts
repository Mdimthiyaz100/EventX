import type { RequestHandler } from "express";
import * as movieService from "../services/movie.service.js";
import { uploadMovieImage } from "../config/cloudinary.js";
import { AppError, routeParam, sendData } from "../utils/http.js";
import { movieListQuerySchema } from "../validators/movie.validator.js";

export const adminList: RequestHandler = async (request, response) => {
  const filters = movieListQuerySchema.parse(request.query);
  const result = await movieService.listMovies(filters);
  sendData(response, result);
};

export const adminGet: RequestHandler = async (request, response) => {
  sendData(response, await movieService.getMovieById(routeParam(request.params.id, "id")));
};

export const create: RequestHandler = async (request, response) => {
  sendData(response, await movieService.createMovie(request.body), 201);
};

export const update: RequestHandler = async (request, response) => {
  sendData(response, await movieService.updateMovie(routeParam(request.params.id, "id"), request.body));
};

export const remove: RequestHandler = async (request, response) => {
  sendData(response, await movieService.deleteMovie(routeParam(request.params.id, "id")));
};

export const changeStatus: RequestHandler = async (request, response) => {
  const current = await movieService.getMovieById(routeParam(request.params.id, "id"));
  const updated = await movieService.updateMovie(current.id, { status: request.body.status });
  sendData(response, updated);
};

export const uploadImage: RequestHandler = async (request, response) => {
  if (!request.file) throw new AppError(400, "IMAGE_REQUIRED", "Choose an image to upload.");
  const result = await uploadMovieImage(request.file, request.query.kind as "poster" | "banner");
  sendData(response, result, 201);
};

export const publicList: RequestHandler = async (request, response) => {
  const filters = movieListQuerySchema.parse(request.query);
  const result = await movieService.listMovies(filters, true);
  sendData(response, result);
};

export const publicGet: RequestHandler = async (request, response) => {
  sendData(response, await movieService.getPublishedMovieBySlug(routeParam(request.params.slug, "slug")));
};
