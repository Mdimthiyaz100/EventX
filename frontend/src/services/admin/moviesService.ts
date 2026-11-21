import {
  listAdminMovies as fetchAdminMovies,
  getAdminMovie as fetchAdminMovie,
  saveMovie,
  deleteMovie,
  type Movie,
  type MovieInput,
  type MovieListResult,
} from "../movieService";

export type { Movie, MovieInput, MovieListResult };

export async function listAdminMovies(params: Record<string, string | number | undefined> = {}): Promise<MovieListResult> {
  return fetchAdminMovies(params);
}

export async function getAdminMovie(id: string): Promise<Movie> {
  return fetchAdminMovie(id);
}

export async function createAdminMovie(data: MovieInput): Promise<Movie> {
  return saveMovie(data);
}

export async function updateAdminMovie(id: string, data: MovieInput): Promise<Movie> {
  return saveMovie(data, id);
}

export async function deleteAdminMovie(id: string): Promise<{ deleted: boolean }> {
  return deleteMovie(id);
}

export default {
  listAdminMovies,
  getAdminMovie,
  createAdminMovie,
  updateAdminMovie,
  deleteAdminMovie,
};
