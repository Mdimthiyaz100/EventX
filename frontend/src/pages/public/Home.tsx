import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Calendar,
  MapPin,
  Play,
  Ticket,
  ChevronRight,
  Flame,
  Film,
  Music,
  Laugh,
  Heart,
  Star,
  Sparkles,
  UtensilsCrossed,
  Trophy,
  Compass,
  ShoppingBag,
  Theater,
  ChevronLeft,
} from "lucide-react";
import { apiGet } from "../../services/api";
import type { EventItem, MovieItem } from "../../types/content";
import { useWishlist } from "../../context/WishlistContext";

export default function Home() {
  const navigate = useNavigate();
  const { isWishlisted, toggleWishlist } = useWishlist();

  // State
  const [events, setEvents] = useState<EventItem[]>([]);
  const [movies, setMovies] = useState<MovieItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeHeroIndex, setActiveHeroIndex] = useState(0);

  // Load live data from DB APIs
  useEffect(() => {
    let mounted = true;
    async function loadData() {
      try {
        setLoading(true);
        const [eventsRes, moviesRes] = await Promise.allSettled([
          apiGet("/events?limit=50"),
          apiGet("/movies?limit=20"),
        ]);

        if (mounted) {
          if (eventsRes.status === "fulfilled" && Array.isArray(eventsRes.value)) {
            setEvents(eventsRes.value as EventItem[]);
          }
          if (
            moviesRes.status === "fulfilled" &&
            moviesRes.value &&
            typeof moviesRes.value === "object" &&
            "movies" in (moviesRes.value as Record<string, unknown>)
          ) {
            setMovies((moviesRes.value as { movies: MovieItem[] }).movies);
          }
        }
      } catch (err) {
        console.error("Failed to load home data", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      mounted = false;
    };
  }, []);

  // Filter hero banner candidates
  const heroCandidates = useMemo(() => {
    if (events.length > 0) return events.slice(0, 4);
    return [
      {
        id: "hero-featured",
        title: "Anirudh Live in Chennai",
        category: "Concerts",
        description: "A high-energy musical night featuring Anirudh's biggest hits, spectacular visuals and stadium acoustics.",
        location: "YMCA Grounds, Nandanam, Chennai",
        startDate: "2027-01-28T19:00:00.000Z",
        price: 1499,
        imageUrl: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=1600&q=80",
      } as unknown as EventItem,
    ];
  }, [events]);

  const currentHero = heroCandidates[activeHeroIndex] || heroCandidates[0];

  // Category Icon cards matching top navigation row in screenshot
  const categoryTiles = [
    { label: "Events", icon: Ticket, link: "/events" },
    { label: "Movies", icon: Film, link: "/movies" },
    { label: "Dining", icon: UtensilsCrossed, link: "/dining" },
    { label: "Sports & Play", icon: Trophy, link: "/sports" },
    { label: "Activities", icon: Compass, link: "/events?category=Activities" },
    { label: "Attractions", icon: Sparkles, link: "/events?category=Attractions" },
    { label: "Stores", icon: ShoppingBag, link: "/events?category=Stores" },
    { label: "Comedy", icon: Laugh, link: "/comedy" },
    { label: "Concerts", icon: Music, link: "/concerts" },
    { label: "Theatre", icon: Theater, link: "/theatre" },
  ];

  return (
    <div className="min-h-screen bg-[#000000] text-white">
      {/* ================= 1. HERO BANNER SECTION ================= */}
      <section className="relative mx-auto max-w-[1440px] px-4 pt-4 sm:px-8 lg:px-12">
        <div className="relative min-h-[460px] sm:min-h-[500px] w-full overflow-hidden rounded-3xl border border-[#292929] bg-[#0A0A0A] shadow-2xl">
          {/* Background image & gradient overlay */}
          <div
            className="absolute inset-0 bg-cover bg-center transition-all duration-700"
            style={{
              backgroundImage: `url(${currentHero.imageUrl || "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=1600&q=80"})`,
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40" />
          </div>

          {/* Hero Content */}
          <div className="relative z-10 flex min-h-[460px] sm:min-h-[500px] flex-col justify-end p-6 sm:p-12 lg:max-w-2xl">
            <span className="mb-3 inline-flex w-fit items-center gap-1.5 rounded-md bg-[#ED1C24] px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
              <Flame size={13} />
              {currentHero.category?.toUpperCase() || "FEATURED LIVE"}
            </span>

            <h1 className="font-display text-4xl sm:text-6xl font-black uppercase tracking-tight text-white leading-none">
              {currentHero.title}
            </h1>

            <p className="mt-4 line-clamp-2 text-sm text-[#BDBDBD] leading-relaxed">
              {currentHero.description || "Join thousands of fans for this unforgettable live experience. Book early to secure the best seats."}
            </p>

            {/* Event Meta: Date & Venue */}
            <div className="mt-6 flex flex-wrap items-center gap-5 text-xs font-semibold text-[#FFFFFF]">
              <div className="flex items-center gap-2">
                <Calendar size={15} className="text-[#ED1C24]" />
                <span>
                  {currentHero.startDate
                    ? new Date(currentHero.startDate).toLocaleDateString("en-IN", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })
                    : "Live Dates Available"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={15} className="text-[#ED1C24]" />
                <span className="truncate max-w-[260px]">{currentHero.location || currentHero.city || "Chennai Venue"}</span>
              </div>
            </div>

            {/* Hero CTAs */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                to={`/events/${currentHero.id}`}
                className="inline-flex items-center gap-2 rounded-xl bg-[#ED1C24] px-7 py-3 text-sm font-bold uppercase tracking-wider text-white shadow-lg shadow-[#ED1C24]/30 transition hover:bg-[#FF3038] hover:scale-[1.02]"
              >
                Book Now
                <ChevronRight size={16} />
              </Link>

              <button
                type="button"
                onClick={() => navigate(`/events/${currentHero.id}`)}
                className="inline-flex items-center gap-2 rounded-xl border border-[#292929] bg-[#111111]/80 px-5 py-3 text-sm font-semibold text-white backdrop-blur-md transition hover:border-[#ED1C24] hover:bg-[#171717]"
              >
                <Play size={15} className="text-[#ED1C24] fill-[#ED1C24]" />
                Watch Trailer
              </button>
            </div>
          </div>

          {/* Carousel Arrows */}
          {heroCandidates.length > 1 && (
            <div className="absolute bottom-6 right-6 z-20 flex items-center gap-2">
              <button
                onClick={() => setActiveHeroIndex((prev) => (prev > 0 ? prev - 1 : heroCandidates.length - 1))}
                className="flex size-9 items-center justify-center rounded-full border border-[#292929] bg-black/60 text-white backdrop-blur-md transition hover:border-[#ED1C24] hover:bg-[#ED1C24]"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setActiveHeroIndex((prev) => (prev < heroCandidates.length - 1 ? prev + 1 : 0))}
                className="flex size-9 items-center justify-center rounded-full border border-[#292929] bg-black/60 text-white backdrop-blur-md transition hover:border-[#ED1C24] hover:bg-[#ED1C24]"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ================= 2. VISUAL CATEGORY NAVIGATION TILES ================= */}
      <section className="mx-auto max-w-[1440px] px-4 py-8 sm:px-8 lg:px-12">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5 lg:grid-cols-10">
          {categoryTiles.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.label}
                to={cat.link}
                className="group flex flex-col items-center justify-center gap-2 rounded-2xl border border-[#292929] bg-[#111111] p-3.5 text-center transition hover:border-[#ED1C24] hover:bg-[#171717] hover:shadow-lg hover:shadow-[#ED1C24]/10"
              >
                <div className="flex size-10 items-center justify-center rounded-xl bg-[#000000] border border-[#292929] text-[#ED1C24] group-hover:scale-110 group-hover:border-[#ED1C24] transition-transform">
                  <Icon size={18} />
                </div>
                <span className="text-xs font-semibold text-[#BDBDBD] group-hover:text-white transition">
                  {cat.label}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ================= 3. TRENDING NEAR YOU ================= */}
      <section className="mx-auto max-w-[1440px] px-4 py-6 sm:px-8 lg:px-12">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="text-[#ED1C24]" size={22} />
            <h2 className="font-display text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
              Trending Near You
            </h2>
          </div>
          <Link
            to="/events"
            className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[#ED1C24] hover:text-[#FF3038] transition"
          >
            View All <ChevronRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-72 rounded-2xl border border-[#292929] bg-[#111111] animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {events.slice(0, 4).map((evt) => (
              <div
                key={evt.id}
                className="group relative overflow-hidden rounded-2xl border border-[#292929] bg-[#111111] transition hover:border-[#ED1C24] hover:shadow-xl hover:shadow-[#ED1C24]/10"
              >
                {/* Image */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-black">
                  <img
                    src={evt.imageUrl || "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=800&q=80"}
                    alt={evt.title}
                    className="size-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <button
                    onClick={() => toggleWishlist(evt.id)}
                    className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md transition hover:bg-[#ED1C24]"
                  >
                    <Heart size={14} className={isWishlisted(evt.id) ? "fill-[#ED1C24] text-[#ED1C24]" : ""} />
                  </button>
                  <span className="absolute bottom-3 left-3 rounded-md bg-black/70 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-md">
                    {evt.category || "Live"}
                  </span>
                </div>

                {/* Body */}
                <div className="p-4">
                  <h3 className="line-clamp-1 text-base font-bold text-white group-hover:text-[#ED1C24] transition">
                    {evt.title}
                  </h3>
                  <div className="mt-2 flex items-center justify-between text-xs text-[#BDBDBD]">
                    <span className="truncate max-w-[150px]">{evt.location || evt.city || "Chennai"}</span>
                    <span className="font-bold text-[#ED1C24]">₹{evt.price ?? 499} onwards</span>
                  </div>

                  <Link
                    to={`/events/${evt.id}`}
                    className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#171717] py-2 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-[#ED1C24]"
                  >
                    Select Seats
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ================= 4. POPULAR MOVIES ROW ================= */}
      <section className="mx-auto max-w-[1440px] px-4 py-8 sm:px-8 lg:px-12">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Film className="text-[#ED1C24]" size={22} />
            <h2 className="font-display text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
              Movies in Cinemas
            </h2>
          </div>
          <Link
            to="/movies"
            className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[#ED1C24] hover:text-[#FF3038] transition"
          >
            View All <ChevronRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-4">
          {movies.slice(0, 4).map((movie) => (
            <Link
              key={movie.id}
              to={`/movies/${movie.slug}`}
              className="group relative overflow-hidden rounded-2xl border border-[#292929] bg-[#111111] transition hover:border-[#ED1C24] hover:shadow-xl"
            >
              <div className="relative aspect-[2/3] w-full overflow-hidden bg-black">
                <img
                  src={movie.posterUrl}
                  alt={movie.title}
                  className="size-full object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs font-bold text-white">
                  <span className="flex items-center gap-1 text-[#ED1C24]">
                    <Star size={13} className="fill-[#ED1C24]" /> 4.8
                  </span>
                  <span className="rounded bg-[#ED1C24] px-1.5 py-0.5 text-[10px] uppercase">
                    {movie.language}
                  </span>
                </div>
              </div>
              <div className="p-3">
                <h3 className="line-clamp-1 text-sm font-bold text-white group-hover:text-[#ED1C24] transition">
                  {movie.title}
                </h3>
                <p className="mt-1 text-xs text-[#777777]">{movie.genre}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ================= 5. EVENTX PASS MEMBERSHIP CALLOUT ================= */}
      <section className="mx-auto max-w-[1440px] px-4 py-8 sm:px-8 lg:px-12">
        <div className="relative overflow-hidden rounded-3xl border border-[#ED1C24]/30 bg-gradient-to-r from-[#171717] via-[#111111] to-[#0A0A0A] p-8 sm:p-12 shadow-2xl">
          <div className="absolute right-0 top-0 -mr-20 -mt-20 size-80 rounded-full bg-[#ED1C24]/10 blur-3xl" />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-xl">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#ED1C24]/40 bg-[#ED1C24]/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#ED1C24]">
                <Sparkles size={13} /> Exclusive Member Privileges
              </span>
              <h2 className="mt-4 font-display text-3xl sm:text-4xl font-black uppercase tracking-tight text-white">
                Unlock Event<span className="text-[#ED1C24]">X</span> Pass
              </h2>
              <p className="mt-2 text-sm text-[#BDBDBD] leading-relaxed">
                Enjoy 10% cashback on all bookings, zero convenience fees on concerts, priority seat access, and member-only secret comedy lineups.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="text-right">
                <span className="text-xs uppercase text-[#777777]">Starting at</span>
                <p className="font-display text-2xl font-black text-white">₹299<span className="text-xs font-normal text-[#777777]">/month</span></p>
              </div>
              <Link
                to="/rewards"
                className="rounded-xl bg-[#ED1C24] px-6 py-3 text-sm font-bold uppercase tracking-wider text-white shadow-lg shadow-[#ED1C24]/20 transition hover:bg-[#FF3038]"
              >
                Get EventX Pass
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
