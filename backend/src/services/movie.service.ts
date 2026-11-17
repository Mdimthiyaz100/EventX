import { MovieStatus, Prisma } from "@prisma/client";
import { prisma } from "../config/database.js";
import { cloudinaryPublicId, deleteCloudinaryImage } from "../config/cloudinary.js";
import { AppError } from "../utils/http.js";

export interface MovieFilters {
  page: number;
  limit: number;
  search?: string;
  language?: string;
  genre?: string;
  status?: MovieStatus;
  sort: "asc" | "desc";
}

function slugFromTitle(title: string): string {
  return title.normalize("NFKD").toLowerCase().replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 180) || "movie";
}

async function uniqueSlug(title: string, exceptId?: string): Promise<string> {
  const base = slugFromTitle(title);
  let candidate = base;
  let suffix = 2;
  while (await prisma.movie.findFirst({ where: { slug: candidate, ...(exceptId ? { id: { not: exceptId } } : {}) }, select: { id: true } })) {
    candidate = `${base.slice(0, 190)}-${suffix++}`;
  }
  return candidate;
}

function movieWhere(filters: MovieFilters, publicOnly = false): Prisma.MovieWhereInput {
  return {
    ...(publicOnly ? { status: MovieStatus.PUBLISHED } : filters.status ? { status: filters.status } : {}),
    ...(filters.language ? { language: { contains: filters.language } } : {}),
    ...(filters.genre ? { genre: { contains: filters.genre } } : {}),
    ...(filters.search ? { OR: [
      { title: { contains: filters.search } },
      { description: { contains: filters.search } },
      { director: { contains: filters.search } },
      { cast: { contains: filters.search } },
    ] } : {}),
  };
}

export async function listMovies(filters: MovieFilters, publicOnly = false) {
  const where = movieWhere(filters, publicOnly);
  const [total, movies] = await prisma.$transaction([
    prisma.movie.count({ where }),
    prisma.movie.findMany({
      where,
      orderBy: [{ featured: "desc" }, { releaseDate: filters.sort }],
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit,
    }),
  ]);
  return { movies, pagination: { page: filters.page, limit: filters.limit, total, pages: Math.ceil(total / filters.limit) } };
}

export async function getMovieById(id: string) {
  const movie = await prisma.movie.findUnique({ where: { id } });
  if (!movie) throw new AppError(404, "MOVIE_NOT_FOUND", "Movie not found.");
  return movie;
}

export async function getPublishedMovieBySlug(slug: string) {
  const movie = await prisma.movie.findFirst({ where: { slug, status: MovieStatus.PUBLISHED } });
  if (!movie) throw new AppError(404, "MOVIE_NOT_FOUND", "Movie not found.");
  return movie;
}

export async function createMovie(input: Omit<Prisma.MovieCreateInput, "slug">) {
  return prisma.movie.create({ data: { ...input, slug: await uniqueSlug(input.title) } });
}

export async function updateMovie(id: string, input: Prisma.MovieUpdateInput) {
  const existing = await getMovieById(id);
  return prisma.movie.update({
    where: { id },
    data: { ...input, ...(typeof input.title === "string" ? { slug: await uniqueSlug(input.title, id) } : {}) },
  }).then(async (movie) => {
    await removeUnreferencedAssets([existing.posterUrl, existing.bannerUrl], [movie.posterUrl, movie.bannerUrl]);
    return movie;
  });
}

async function removeUnreferencedAssets(oldUrls: (string | null)[], currentUrls: (string | null)[] = []) {
  const current = new Set(currentUrls.filter((url): url is string => Boolean(url)));
  const ids = new Set(oldUrls.filter((url): url is string => Boolean(url) && !current.has(url!))
    .map((url) => cloudinaryPublicId(url!)).filter((id): id is string => Boolean(id)));
  for (const publicId of ids) {
    const [movie, event] = await Promise.all([
      prisma.movie.findFirst({ where: { OR: [{ posterUrl: { contains: publicId } }, { bannerUrl: { contains: publicId } }] }, select: { id: true } }),
      prisma.event.findFirst({ where: { imageUrl: { contains: publicId } }, select: { id: true } }),
    ]);
    if (movie || event) continue;
    try { await deleteCloudinaryImage(publicId); }
    catch (error) { console.error("Could not remove an unused Cloudinary movie image.", error instanceof Error ? error.message : "Unknown error"); }
  }
}

export async function deleteMovie(id: string) {
  const movie = await getMovieById(id);
  await prisma.movie.delete({ where: { id } });
  await removeUnreferencedAssets([movie.posterUrl, movie.bannerUrl]);
  return { deleted: true };
}
