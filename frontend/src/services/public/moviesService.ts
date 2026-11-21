import { listPublishedMovies, getPublishedMovie, type Movie, type MovieListResult } from "../movieService";

export type { Movie, MovieListResult };

export async function getPublishedMovies(params: Record<string, string | number | undefined> = {}): Promise<MovieListResult> {
  return listPublishedMovies(params);
}

export async function getPublishedMovieBySlug(slug: string): Promise<Movie> {
  return getPublishedMovie(slug);
}

export default {
  getPublishedMovies,
  getPublishedMovieBySlug,
};
