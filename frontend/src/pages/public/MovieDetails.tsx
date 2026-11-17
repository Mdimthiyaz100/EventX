import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, CalendarDays, Clock3, Play, Heart, Film } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { getPublishedMovie } from "../../services/movieService";
import { useWishlist } from "../../context/WishlistContext";

export default function MovieDetails() {
  const { slug = "" } = useParams();
  const { isWishlisted, toggleWishlist } = useWishlist();

  const query = useQuery({
    queryKey: ["public-movie", slug],
    queryFn: () => getPublishedMovie(slug),
  });

  const movie = query.data;

  if (query.isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-2 border-white/20 border-t-[#E31824]" />
      </div>
    );
  }

  if (query.isError || !movie) {
    return (
      <div className="mx-auto max-w-xl py-24 px-4 text-center">
        <Film size={44} className="mx-auto text-red-500 mb-3" />
        <h2 className="font-display text-3xl font-black uppercase text-white">Movie Unavailable</h2>
        <p className="mt-2 text-sm text-slate-400">This title is currently not published or has ended its run.</p>
        <Link
          to="/movies"
          className="mt-6 inline-block rounded-xl bg-[#E31824] px-6 py-2.5 text-xs font-bold uppercase text-white"
        >
          &larr; Browse Movies
        </Link>
      </div>
    );
  }

  const wishlisted = isWishlisted(movie.id);

  return (
    <div className="min-h-screen text-white">
      {/* 1. CINEMATIC HERO BANNER */}
      <section className="relative min-h-[460px] overflow-hidden bg-[#0A0713] sm:min-h-[580px]">
        {movie.bannerUrl && (
          <img
            src={movie.bannerUrl}
            alt={movie.title}
            className="absolute inset-0 size-full object-cover opacity-40 filter brightness-70 scale-105"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0713] via-[#0A0713]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A0713]/95 via-[#0A0713]/70 to-transparent" />

        <div className="relative mx-auto flex min-h-[460px] max-w-[1440px] items-end gap-8 px-5 py-12 sm:min-h-[580px] sm:px-8 lg:px-12">
          {/* Movie Poster */}
          <img
            src={movie.posterUrl}
            alt={`${movie.title} poster`}
            className="hidden w-52 rounded-2xl border border-white/10 shadow-2xl sm:block lg:w-64 shrink-0"
          />

          <div className="max-w-2xl">
            <Link
              to="/movies"
              className="mb-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-white"
            >
              <ArrowLeft size={14} />
              <span>All Movies</span>
            </Link>

            <div className="flex items-center gap-3 mb-2">
              <span className="rounded-md border border-red-500/30 bg-red-500/10 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-red-400">
                {movie.genre}
              </span>
              <span className="rounded-md border border-white/20 bg-black/50 px-2 py-0.5 text-[10px] font-extrabold uppercase text-slate-300">
                {movie.certification}
              </span>
            </div>

            <h1 className="font-display text-4xl sm:text-6xl font-black uppercase tracking-tight text-white leading-none">
              {movie.title}
            </h1>

            <p className="mt-4 text-xs sm:text-sm font-semibold text-slate-300">
              {movie.language} · {Math.floor(movie.duration / 60)}h {movie.duration % 60}m duration
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <CalendarDays size={14} className="text-slate-400" />
                <span>
                  {new Intl.DateTimeFormat("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  }).format(new Date(movie.releaseDate))}
                </span>
              </span>
              <span>Directed by {movie.director}</span>
            </div>

            <div className="mt-7 flex items-center gap-4">
              {movie.trailerUrl && (
                <a
                  href={movie.trailerUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#E31824] px-5 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-red-600/30 hover:bg-[#c8141f] transition active:scale-95"
                >
                  <Play size={14} fill="currentColor" />
                  <span>Watch Trailer</span>
                </a>
              )}

              <button
                onClick={() => toggleWishlist(movie.id)}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-bold text-slate-300 hover:text-white hover:bg-white/10 transition"
              >
                <Heart
                  size={15}
                  className={wishlisted ? "fill-[#E31824] text-[#E31824]" : ""}
                />
                <span>{wishlisted ? "In Wishlist" : "Save Movie"}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. MOVIE DETAILS & CAST */}
      <section className="mx-auto grid max-w-[1440px] gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[1fr_320px] lg:px-12">
        <div className="rounded-3xl border border-white/10 bg-[#161224] p-6 sm:p-8">
          <span className="text-xs font-bold uppercase tracking-widest text-[#E31824]">
            SYNOPSIS
          </span>
          <h2 className="font-display text-2xl font-bold uppercase text-white mt-1 mb-4">
            The Story
          </h2>
          <p className="whitespace-pre-line text-sm leading-relaxed text-slate-300">
            {movie.description}
          </p>
        </div>

        <aside className="rounded-3xl border border-white/10 bg-[#161224] p-6 space-y-6">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
              Starring Cast
            </span>
            <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-200">
              {movie.cast || "Cast details coming soon."}
            </p>
          </div>

          <div className="border-t border-white/10 pt-4">
            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
              Runtime
            </span>
            <div className="mt-1 flex items-center gap-2 text-sm font-bold text-white">
              <Clock3 size={15} className="text-[#E31824]" />
              <span>{movie.duration} Minutes</span>
            </div>
          </div>

          <div className="border-t border-white/10 pt-4">
            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
              Language & Certification
            </span>
            <p className="mt-1 text-sm font-bold text-white">
              {movie.language} ({movie.certification})
            </p>
          </div>
        </aside>
      </section>
    </div>
  );
}
