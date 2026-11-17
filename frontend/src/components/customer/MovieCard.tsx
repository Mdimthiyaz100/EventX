import { Link } from "react-router-dom";
import { Film, Clock, Heart } from "lucide-react";
import type { MovieItem } from "../../types/content";
import { useWishlist } from "../../context/WishlistContext";

interface MovieCardProps {
  movie: MovieItem;
}

export default function MovieCard({ movie }: MovieCardProps) {
  const { isWishlisted, toggleWishlist } = useWishlist();
  const wishlisted = isWishlisted(movie.id);

  const releaseYear = movie.releaseDate
    ? new Date(movie.releaseDate).getFullYear()
    : "2026";

  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-[#161224]/80 backdrop-blur-md transition-all duration-300 hover:border-white/20 hover:shadow-2xl hover:shadow-red-950/20 hover:-translate-y-1">
      {/* Movie Poster Image (Portrait 2:3) */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-slate-900">
        <img
          src={
            movie.posterUrl ||
            "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80"
          }
          alt={movie.title}
          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#161224] via-transparent to-black/40" />

        {/* Certification tag */}
        <div className="absolute top-3 left-3">
          <span className="inline-block rounded-md border border-white/20 bg-black/60 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-widest text-slate-200 backdrop-blur-md">
            {movie.certification}
          </span>
        </div>

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(movie.id);
          }}
          className="absolute top-3 right-3 grid size-8 place-items-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-md transition hover:scale-110 hover:bg-black/60"
          title={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart
            size={15}
            className={wishlisted ? "fill-[#E31824] text-[#E31824]" : "text-white"}
          />
        </button>

        {/* Language Badge on bottom right of poster */}
        <div className="absolute bottom-3 right-3">
          <span className="rounded-md bg-[#E31824]/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-md shadow-md">
            {movie.language}
          </span>
        </div>
      </div>

      {/* Info Section */}
      <div className="flex flex-1 flex-col justify-between p-4 sm:p-5">
        <div>
          <Link to={`/movies/${movie.slug}`}>
            <h3 className="font-display text-lg font-bold uppercase tracking-wide text-white transition hover:text-[#E31824] line-clamp-1">
              {movie.title}
            </h3>
          </Link>

          <p className="mt-1 text-xs text-slate-400 line-clamp-1">
            {movie.genre}
          </p>

          <div className="mt-2.5 flex items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Clock size={12} className="text-slate-400" />
              <span>{movie.duration}m</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Film size={12} className="text-slate-400" />
              <span>{releaseYear}</span>
            </span>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-4 border-t border-white/5 pt-3">
          <Link
            to={`/movies/${movie.slug}`}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-white/10 py-2 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-[#E31824] active:scale-95"
          >
            <span>View Details</span>
            <span>&rarr;</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
