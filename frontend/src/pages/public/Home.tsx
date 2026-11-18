import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  MapPin,
  Sparkles,
  ChevronRight,
  Flame,
  Film,
  Music,
  Laugh,
  Award,
  Layers,
  X
} from "lucide-react";
import { apiGet } from "../../services/api";
import type { EventItem, MovieItem } from "../../types/content";
import EventCard from "../../components/customer/EventCard";
import MovieCard from "../../components/customer/MovieCard";

export default function Home() {
  const navigate = useNavigate();

  // State
  const [events, setEvents] = useState<EventItem[]>([]);
  const [movies, setMovies] = useState<MovieItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [activeCategoryTab, setActiveCategoryTab] = useState("All");

  // Fetch dynamic data from backend APIs
  useEffect(() => {
    let mounted = true;

    async function loadData() {
      try {
        setLoading(true);
        const [eventsRes, moviesRes, categoriesRes, citiesRes] = await Promise.allSettled([
          apiGet("/events?limit=50"),
          apiGet("/movies?limit=20"),
          apiGet("/categories"),
          apiGet("/cities"),
        ]);

        if (mounted) {
          if (eventsRes.status === "fulfilled" && Array.isArray(eventsRes.value)) {
            setEvents(eventsRes.value as EventItem[]);
          }
          if (
            moviesRes.status === "fulfilled" &&
            moviesRes.value &&
            typeof moviesRes.value === "object" &&
            "movies" in (moviesRes.value as any)
          ) {
            setMovies((moviesRes.value as any).movies as MovieItem[]);
          }
          if (categoriesRes.status === "fulfilled" && Array.isArray(categoriesRes.value)) {
            setCategories(categoriesRes.value as string[]);
          }
          if (citiesRes.status === "fulfilled" && Array.isArray(citiesRes.value)) {
            const fetchedCities = citiesRes.value as string[];
            setCities(fetchedCities);
            if (fetchedCities.length > 0) {
              setSelectedCity(fetchedCities[0]);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load homepage resources:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadData();
    return () => {
      mounted = false;
    };
  }, []);

  // Category Icon helper
  const getCategoryIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes("comedy")) return <Laugh size={18} />;
    if (n.includes("concert") || n.includes("music")) return <Music size={18} />;
    if (n.includes("theatre") || n.includes("drama")) return <Sparkles size={18} />;
    if (n.includes("movie") || n.includes("cinema")) return <Film size={18} />;
    if (n.includes("sport")) return <Award size={18} />;
    return <Layers size={18} />;
  };

  // Featured events
  const featuredEvents = useMemo(() => {
    return events.filter((e) => e.featured || e.category === "Concerts");
  }, [events]);

  // Comedy Shows
  const comedyShows = useMemo(() => {
    return events.filter((e) => e.category.toLowerCase().includes("comedy"));
  }, [events]);

  // Concerts
  const concertEvents = useMemo(() => {
    return events.filter((e) => e.category.toLowerCase().includes("concert"));
  }, [events]);

  // Theatre & Culture
  const theatreEvents = useMemo(() => {
    return events.filter((e) => e.category.toLowerCase().includes("theatre"));
  }, [events]);

  // Sports
  const sportsEvents = useMemo(() => {
    return events.filter((e) => e.category.toLowerCase().includes("sport"));
  }, [events]);

  // Filtered by current tab selection (if user clicks on category bar)
  const tabFilteredEvents = useMemo(() => {
    if (activeCategoryTab === "All") return events;
    return events.filter(
      (e) => e.category.toLowerCase() === activeCategoryTab.toLowerCase()
    );
  }, [events, activeCategoryTab]);

  // Handle Search Submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.append("search", searchQuery.trim());
    if (selectedCity) params.append("city", selectedCity);
    if (selectedDate) params.append("date", selectedDate);
    navigate(`/events?${params.toString()}`);
  };

  return (
    <div className="relative w-full overflow-hidden">
      {/* 1. HERO SECTION WITH CINEMATIC STAGE BACKGROUND */}
      <section className="relative min-h-[500px] sm:min-h-[560px] lg:min-h-[620px] w-full overflow-hidden bg-[#0A0713] flex flex-col justify-center">
        {/* Background Image: Stadium Concert Crowd */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-45 scale-105 filter brightness-75"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=2400&q=85')`,
          }}
        />

        {/* Ambient colored lighting glows (Left red glow, right purple glow) */}
        <div className="absolute top-1/4 -left-40 h-[500px] w-[500px] rounded-full bg-red-600/20 blur-[140px] pointer-events-none" />
        <div className="absolute top-1/4 -right-40 h-[500px] w-[500px] rounded-full bg-purple-600/25 blur-[140px] pointer-events-none" />

        {/* Gradient overlays for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0713] via-[#0A0713]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A0713] via-transparent to-[#0A0713]" />

        {/* Content Container */}
        <div className="relative z-10 mx-auto max-w-[1440px] w-full px-5 sm:px-8 lg:px-12 py-16 sm:py-20 flex flex-col items-start">
          <div className="flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-red-400 backdrop-blur-md mb-4">
            <Sparkles size={14} className="text-[#E31824]" />
            <span>DISCOVER · BOOK · EXPERIENCE</span>
          </div>

          <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tight text-white leading-none max-w-3xl">
            FIND & BOOK <br />
            <span className="text-white">AMAZING EVENTS</span>
          </h1>

          <p className="mt-4 max-w-xl text-sm sm:text-base text-slate-300 leading-relaxed">
            Movies, Comedy Shows, Live Events, Concerts and more near you.
          </p>

          {/* Central Search Box */}
          <form
            onSubmit={handleSearchSubmit}
            className="mt-8 flex w-full max-w-2xl flex-col sm:flex-row items-center gap-2 rounded-2xl sm:rounded-full border border-white/15 bg-[#171328]/90 p-2 shadow-2xl backdrop-blur-xl"
          >
            <div className="flex flex-1 items-center gap-3 px-3 w-full">
              <Search size={18} className="text-slate-400 shrink-0" />
              <input
                id="main-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search events, movies, artists..."
                className="w-full bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="text-slate-400 hover:text-white"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <div className="hidden sm:block h-6 w-[1px] bg-white/10" />

            {/* City select inside search bar */}
            <div className="flex items-center gap-2 px-3 py-1 text-xs font-semibold text-slate-300 shrink-0 w-full sm:w-auto">
              <MapPin size={15} className="text-[#E31824]" />
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer"
              >
                {cities.length === 0 ? (
                  <option value="" className="bg-[#171328] text-white">All Locations</option>
                ) : (
                  cities.map((c) => (
                    <option key={c} value={c} className="bg-[#171328] text-white">
                      {c}
                    </option>
                  ))
                )}
              </select>
            </div>

            <button
              type="submit"
              className="flex w-full sm:w-auto items-center justify-center rounded-xl sm:rounded-full bg-[#E31824] px-6 py-3 text-xs font-extrabold uppercase tracking-wider text-white shadow-lg shadow-red-600/30 transition hover:bg-[#c8141f] active:scale-95"
            >
              <span>Search</span>
            </button>
          </form>
        </div>
      </section>

      {/* 2. DYNAMIC CATEGORY PILL NAVIGATION */}
      <section className="relative z-20 mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12 -mt-6">
        <div className="flex items-center justify-start gap-2 overflow-x-auto rounded-2xl border border-white/10 bg-[#140F22]/90 p-2 shadow-2xl backdrop-blur-xl no-scrollbar">
          {/* "All" Tab */}
          <button
            onClick={() => setActiveCategoryTab("All")}
            className={`flex items-center gap-2.5 rounded-xl px-5 py-3 text-xs font-bold uppercase tracking-wider transition whitespace-nowrap ${
              activeCategoryTab === "All"
                ? "bg-[#E31824] text-white shadow-md shadow-red-600/30"
                : "text-slate-300 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Layers size={16} />
            <span>All</span>
          </button>

          {/* Dynamic Categories From Admin / Backend */}
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategoryTab(cat)}
              className={`flex items-center gap-2.5 rounded-xl px-5 py-3 text-xs font-bold uppercase tracking-wider transition whitespace-nowrap ${
                activeCategoryTab === cat
                  ? "bg-[#E31824] text-white shadow-md shadow-red-600/30"
                  : "text-slate-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              {getCategoryIcon(cat)}
              <span>{cat}</span>
            </button>
          ))}

          {/* Movies link pill */}
          <Link
            to="/movies"
            className="flex items-center gap-2.5 rounded-xl px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-300 hover:bg-white/10 hover:text-white transition whitespace-nowrap"
          >
            <Film size={16} />
            <span>Movies</span>
          </Link>
        </div>
      </section>

      {/* 3. MAIN HOMEPAGE SECTIONS & SIDEBAR CONTAINER */}
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* LEFT 3 COLUMNS: MAIN EVENT FEEDS */}
          <div className="lg:col-span-3 space-y-16">
            {/* If tab is active and not 'All', show filtered results */}
            {activeCategoryTab !== "All" && (
              <section>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="font-display text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-white">
                      {activeCategoryTab}
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Showing curated {activeCategoryTab.toLowerCase()} in {selectedCity}
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveCategoryTab("All")}
                    className="text-xs font-semibold text-[#E31824] hover:underline"
                  >
                    Clear Filter
                  </button>
                </div>

                {tabFilteredEvents.length === 0 ? (
                  <div className="rounded-2xl border border-white/5 bg-[#140F22] p-10 text-center text-slate-400">
                    No {activeCategoryTab} found in this category right now.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                    {tabFilteredEvents.map((event) => (
                      <EventCard key={event.id} event={event} />
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* A. FEATURED EVENTS ROW (From Reference) */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-display text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-white">
                    Featured Events
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Handpicked events happening near you
                  </p>
                </div>
                <Link
                  to="/events?featured=true"
                  className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[#E31824] hover:text-red-400 transition"
                >
                  <span>View All Events</span>
                  <ChevronRight size={14} />
                </Link>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-64 rounded-2xl bg-white/5 animate-pulse" />
                  ))}
                </div>
              ) : featuredEvents.length === 0 ? (
                <div className="rounded-2xl border border-white/5 bg-[#140F22] p-8 text-center text-slate-400">
                  No featured events available right now.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                  {featuredEvents.slice(0, 6).map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              )}
            </section>

            {/* B. COMEDY SHOWS ROW (From Reference) */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-display text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-white flex items-center gap-2">
                    <span className="text-[#E31824]">🎭</span>
                    <span>Comedy Shows</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    The best stand-up and comedy experiences
                  </p>
                </div>
                <Link
                  to="/category/Comedy Shows"
                  className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[#E31824] hover:text-red-400 transition"
                >
                  <span>View All Comedy Shows</span>
                  <ChevronRight size={14} />
                </Link>
              </div>

              {comedyShows.length === 0 ? (
                <div className="rounded-2xl border border-white/5 bg-[#140F22] p-8 text-center text-slate-400">
                  No comedy shows available right now.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {comedyShows.slice(0, 4).map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              )}
            </section>

            {/* C. LATEST MOVIES IN THEATRES */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-display text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-white flex items-center gap-2">
                    <Film size={22} className="text-[#E31824]" />
                    <span>Latest Movies</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Blockbusters & releases in theatres now
                  </p>
                </div>
                <Link
                  to="/movies"
                  className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[#E31824] hover:text-red-400 transition"
                >
                  <span>Explore All Movies</span>
                  <ChevronRight size={14} />
                </Link>
              </div>

              {movies.length === 0 ? (
                <div className="rounded-2xl border border-white/5 bg-[#140F22] p-8 text-center text-slate-400">
                  No movies published right now.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {movies.slice(0, 4).map((movie) => (
                    <MovieCard key={movie.id} movie={movie} />
                  ))}
                </div>
              )}
            </section>

            {/* D. LIVE CONCERTS & FESTIVALS */}
            {concertEvents.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="font-display text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-white flex items-center gap-2">
                      <Music size={22} className="text-purple-400" />
                      <span>Concerts & Musical Gigs</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Stadium tours and intimate acoustic sets
                    </p>
                  </div>
                  <Link
                    to="/category/Concerts"
                    className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[#E31824] hover:text-red-400 transition"
                  >
                    <span>View All Concerts</span>
                    <ChevronRight size={14} />
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                  {concertEvents.slice(0, 3).map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              </section>
            )}

            {/* E. THEATRE & CULTURAL PLAYS */}
            {theatreEvents.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="font-display text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-white">
                      Theatre, Plays & Arts
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Dramatic performances, classical evenings, and stages
                    </p>
                  </div>
                  <Link
                    to="/category/Theatre"
                    className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[#E31824] hover:text-red-400 transition"
                  >
                    <span>View All Theatre</span>
                    <ChevronRight size={14} />
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                  {theatreEvents.slice(0, 3).map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              </section>
            )}

            {/* F. SPORTS MATCHES & ACTIVITIES */}
            {sportsEvents.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="font-display text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-white flex items-center gap-2">
                      <Award size={22} className="text-emerald-400" />
                      <span>Sports & Fitness</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Marathons, tournaments, and outdoor games
                    </p>
                  </div>
                  <Link
                    to="/category/Sports"
                    className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[#E31824] hover:text-red-400 transition"
                  >
                    <span>View All Sports</span>
                    <ChevronRight size={14} />
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                  {sportsEvents.slice(0, 3).map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* RIGHT 1 COLUMN: SIDEBAR (Widgets from Reference Screenshot) */}
          <div className="space-y-6">
            {/* Widget 1: Find Events Near You Filter Form */}
            <div className="rounded-2xl border border-white/10 bg-[#161224] p-5 shadow-xl">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400 mb-4">
                <MapPin size={16} />
                <span>Find Events Near You</span>
              </div>

              <form onSubmit={handleSearchSubmit} className="space-y-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                    Location
                  </label>
                  <div className="relative">
                    <select
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 px-3 text-xs font-semibold text-white focus:border-[#E31824] focus:outline-none"
                    >
                      {cities.length === 0 ? (
                        <option value="" className="bg-[#161224] text-white">All Locations</option>
                      ) : (
                        cities.map((c) => (
                          <option key={c} value={c} className="bg-[#161224] text-white">
                            {c}
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                    Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-white/5 py-2 px-3 text-xs text-white focus:border-[#E31824] focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-[#E31824] py-3 text-xs font-extrabold uppercase tracking-wider text-white shadow-md shadow-red-600/30 transition hover:bg-[#c8141f] active:scale-95"
                >
                  Find Events
                </button>
              </form>
            </div>

            {/* Widget 2: Trending Now (Calculated from Real Database Events & Movies) */}
            <div className="rounded-2xl border border-white/10 bg-[#161224] p-5 shadow-xl">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#E31824] mb-4">
                <Flame size={16} />
                <span>Trending Now</span>
              </div>

              <div className="space-y-3">
                {/* Movies Trending Count */}
                <Link
                  to="/movies"
                  className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 p-3 transition hover:border-[#E31824]/50 hover:bg-white/10"
                >
                  <div className="flex items-center gap-3">
                    <div className="grid size-10 place-items-center rounded-lg bg-red-600/20 text-red-400">
                      <Film size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Movies</p>
                      <p className="text-[10px] text-slate-400">
                        {movies.length > 0 ? `${movies.length} Releases Active` : "Browse Movies"}
                      </p>
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-slate-500" />
                </Link>

                {/* Categories with real dynamic counts from database */}
                {categories.slice(0, 4).map((cat) => {
                  const count = events.filter(
                    (e) => e.category.toLowerCase() === cat.toLowerCase()
                  ).length;
                  return (
                    <Link
                      key={cat}
                      to={`/category/${encodeURIComponent(cat)}`}
                      className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 p-3 transition hover:border-[#E31824]/50 hover:bg-white/10"
                    >
                      <div className="flex items-center gap-3">
                        <div className="grid size-10 place-items-center rounded-lg bg-white/5 text-[#E31824]">
                          {getCategoryIcon(cat)}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">{cat}</p>
                          <p className="text-[10px] text-slate-400">
                            {count > 0 ? `${count} Live ${count === 1 ? "Event" : "Events"}` : "Discover Shows"}
                          </p>
                        </div>
                      </div>
                      <ChevronRight size={14} className="text-slate-500" />
                    </Link>
                  );
                })}

                {categories.length === 0 && movies.length === 0 && (
                  <div className="py-4 text-center text-xs text-slate-500">
                    No active trending listings yet.
                  </div>
                )}
              </div>
            </div>

            {/* Widget 3: Mobile Apps & Perks */}
            <div className="rounded-2xl border border-red-500/25 bg-gradient-to-b from-[#240e16] to-[#160d1b] p-5">
              <h3 className="font-display text-lg font-bold uppercase text-white">
                Exclusive Member Benefits
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-300">
                Create a free EventX account to receive early access to concert ticket sales, zero booking fees on premieres, and flexible cancellation.
              </p>
              <Link
                to="/login"
                className="mt-4 block w-full rounded-xl bg-white/10 py-2.5 text-center text-xs font-bold uppercase tracking-wider text-white hover:bg-white/20 transition"
              >
                Sign In / Join Free
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
