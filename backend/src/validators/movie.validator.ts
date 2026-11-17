import { z } from "zod";

const movieFields = z.object({
  title: z.string().trim().min(1).max(180),
  description: z.string().trim().min(1).max(20_000),
  language: z.string().trim().min(1).max(80),
  genre: z.string().trim().min(1).max(100),
  duration: z.number().int().positive().max(1000),
  certification: z.enum(["U", "UA", "A"]),
  releaseDate: z.string().date(),
  posterUrl: z.string().url().max(1000),
  bannerUrl: z.string().url().max(1000).nullable().optional(),
  trailerUrl: z.union([z.string().url().max(500), z.literal("")]).nullable().optional(),
  director: z.string().trim().min(1).max(180),
  cast: z.string().trim().max(5000),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
  featured: z.boolean().default(false),
}).strict();

export const createMovieSchema = movieFields;
export const updateMovieSchema = movieFields.partial().strict().refine(
  (values) => Object.keys(values).length > 0,
  { message: "Provide at least one movie field to update." },
);

export const movieListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
  search: z.string().trim().max(100).optional(),
  language: z.string().trim().max(80).optional(),
  genre: z.string().trim().max(100).optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
  sort: z.enum(["asc", "desc"]).default("asc"),
});

export const movieStatusSchema = z.object({
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
}).strict();

export const movieImageQuerySchema = z.object({
  kind: z.enum(["poster", "banner"]),
}).strict();
