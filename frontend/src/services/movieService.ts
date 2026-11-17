import { apiRequest, apiUpload } from "./api";

export type MovieStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export interface Movie {
  id: string;
  title: string;
  slug: string;
  description: string;
  language: string;
  genre: string;
  duration: number;
  certification: "U" | "UA" | "A";
  releaseDate: string;
  posterUrl: string;
  bannerUrl: string | null;
  trailerUrl: string | null;
  director: string;
  cast: string;
  status: MovieStatus;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MovieListResult {
  movies: Movie[];
  pagination: { page: number; limit: number; total: number; pages: number };
}

export type MovieInput = Omit<Movie, "id" | "slug" | "createdAt" | "updatedAt">;

export async function listAdminMovies(params: Record<string, string | number | undefined>) {
  return apiRequest<MovieListResult>("GET", "/admin/movies", undefined, params);
}

export async function getAdminMovie(id: string) {
  return apiRequest<Movie>("GET", `/admin/movies/${encodeURIComponent(id)}`);
}

export async function saveMovie(input: MovieInput, id?: string) {
  return apiRequest<Movie>(id ? "PUT" : "POST", id ? `/admin/movies/${encodeURIComponent(id)}` : "/admin/movies", input);
}

export async function deleteMovie(id: string) {
  return apiRequest<{ deleted: boolean }>("DELETE", `/admin/movies/${encodeURIComponent(id)}`);
}

export async function setMovieStatus(id: string, status: MovieStatus) {
  return apiRequest<Movie>("PATCH", `/admin/movies/${encodeURIComponent(id)}/status`, { status });
}

export async function uploadMovieImage(file: File, kind: "poster" | "banner") {
  const form = new FormData();
  form.append("image", file);
  return apiUpload<{ url: string; publicId: string }>(`/admin/movies/images?kind=${kind}`, form);
}

export async function listPublishedMovies(params: Record<string, string | number | undefined>) {
  return apiRequest<MovieListResult>("GET", "/movies", undefined, params);
}

export async function getPublishedMovie(slug: string) {
  return apiRequest<Movie>("GET", `/movies/${encodeURIComponent(slug)}`);
}
