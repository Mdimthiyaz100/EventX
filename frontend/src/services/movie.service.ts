import {
  listPublishedMovies,
  getPublishedMovie,
  listAdminMovies,
  getAdminMovie,
  saveMovie,
  deleteMovie,
  setMovieStatus,
  uploadMovieImage,
  type Movie,
  type MovieListResult,
  type MovieInput,
  type MovieStatus,
} from "./movieService";

export {
  listPublishedMovies,
  getPublishedMovie,
  listAdminMovies,
  getAdminMovie,
  saveMovie,
  deleteMovie,
  setMovieStatus,
  uploadMovieImage,
  type Movie,
  type MovieListResult,
  type MovieInput,
  type MovieStatus,
};

export const movieService = {
  listPublishedMovies,
  getPublishedMovie,
  listAdminMovies,
  getAdminMovie,
  saveMovie,
  deleteMovie,
  setMovieStatus,
  uploadMovieImage,
};
