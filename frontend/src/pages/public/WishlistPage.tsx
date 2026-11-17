import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { useWishlist } from "../../context/WishlistContext";
import { apiGet } from "../../services/api";
import type { EventItem, MovieItem } from "../../types/content";
import EventCard from "../../components/customer/EventCard";
import MovieCard from "../../components/customer/MovieCard";

export default function WishlistPage() {
  const { wishlist } = useWishlist();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [movies, setMovies] = useState<MovieItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadWishlistedItems() {
      try {
        setLoading(true);
        const [eventsRes, moviesRes] = await Promise.allSettled([
          apiGet("/events?limit=50"),
          apiGet("/movies?limit=50"),
        ]);

        if (mounted) {
          if (eventsRes.status === "fulfilled" && Array.isArray(eventsRes.value)) {
            const allEvents = eventsRes.value as EventItem[];
            setEvents(allEvents.filter((e) => wishlist.includes(e.id)));
          }
          if (
            moviesRes.status === "fulfilled" &&
            moviesRes.value &&
            typeof moviesRes.value === "object" &&
            "movies" in (moviesRes.value as any)
          ) {
            const allMovies = (moviesRes.value as any).movies as MovieItem[];
            setMovies(allMovies.filter((m) => wishlist.includes(m.id)));
          }
        }
      } catch (err) {
        console.error("Failed to load wishlist content", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadWishlistedItems();
    return () => {
      mounted = false;
    };
  }, [wishlist]);

  const totalWishlisted = events.length + movies.length;

  return (
    <div className="mx-auto max-w-[1440px] px-4 sm:px-8 lg:px-12 py-10">
      <div className="mb-8 border-b border-white/10 pb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#E31824]">
            <Heart size={14} className="fill-[#E31824]" />
            <span>SAVED FOR LATER</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-black uppercase tracking-tight text-white mt-1">
            MY WISHLIST
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Keep track of shows, concerts, and cinema releases you want to attend.
          </p>
        </div>

        <span className="text-xs font-bold text-slate-400">
          {totalWishlisted} item(s) saved
        </span>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-72 rounded-2xl bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : totalWishlisted === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-[#161224] p-16 text-center">
          <Heart size={48} className="mx-auto text-slate-600 mb-4" />
          <h3 className="font-display text-2xl font-bold uppercase text-white">
            Your Wishlist is Empty
          </h3>
          <p className="mt-2 text-sm text-slate-400 max-w-sm mx-auto">
            Click the heart icon on any movie or live event card to bookmark it for later.
          </p>
          <div className="mt-6 flex justify-center gap-4">
            <Link
              to="/events"
              className="rounded-xl bg-[#E31824] px-6 py-2.5 text-xs font-bold uppercase text-white"
            >
              Browse Events
            </Link>
            <Link
              to="/movies"
              className="rounded-xl bg-white/10 px-6 py-2.5 text-xs font-bold uppercase text-white"
            >
              Browse Movies
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-12">
          {/* Wishlisted Events */}
          {events.length > 0 && (
            <section>
              <h2 className="font-display text-2xl font-bold uppercase tracking-tight text-white mb-6">
                Saved Events ({events.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {events.map((ev) => (
                  <EventCard key={ev.id} event={ev} />
                ))}
              </div>
            </section>
          )}

          {/* Wishlisted Movies */}
          {movies.length > 0 && (
            <section>
              <h2 className="font-display text-2xl font-bold uppercase tracking-tight text-white mb-6">
                Saved Movies ({movies.length})
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
                {movies.map((m) => (
                  <MovieCard key={m.id} movie={m} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
