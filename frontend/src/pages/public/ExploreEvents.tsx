import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, MapPin, X, Layers } from "lucide-react";
import { apiGet } from "../../services/api";
import type { EventItem } from "../../types/content";
import EventCard from "../../components/customer/EventCard";
import { CITY_OPTIONS } from "../../components/customer/UserNavbar";

export default function ExploreEvents() {
  const [searchParams, setSearchParams] = useSearchParams();

  const initialSearch = searchParams.get("search") || "";
  const initialCity = searchParams.get("city") || "";
  const initialCategory = searchParams.get("category") || "";

  const [events, setEvents] = useState<EventItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState(initialSearch);
  const [city, setCity] = useState(initialCity);
  const [category, setCategory] = useState(initialCategory);
  const [priceFilter, setPriceFilter] = useState<"ALL" | "FREE" | "PAID">("ALL");

  useEffect(() => {
    let mounted = true;
    async function fetchData() {
      try {
        setLoading(true);
        const [eventsRes, catsRes] = await Promise.allSettled([
          apiGet("/events?limit=50"),
          apiGet("/categories"),
        ]);
        if (mounted) {
          if (eventsRes.status === "fulfilled" && Array.isArray(eventsRes.value)) {
            setEvents(eventsRes.value as EventItem[]);
          }
          if (catsRes.status === "fulfilled" && Array.isArray(catsRes.value)) {
            setCategories(catsRes.value as string[]);
          }
        }
      } catch (err) {
        console.error("Failed to load events", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchData();
    return () => {
      mounted = false;
    };
  }, []);

  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      // Search query
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesTitle = ev.title.toLowerCase().includes(q);
        const matchesDesc = ev.description.toLowerCase().includes(q);
        const matchesVenue = (ev.venue || "").toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesVenue) return false;
      }
      // City
      if (city && ev.city.toLowerCase() !== city.toLowerCase()) {
        return false;
      }
      // Category
      if (category && ev.category.toLowerCase() !== category.toLowerCase()) {
        return false;
      }
      // Price Filter
      if (priceFilter === "FREE" && ev.price && ev.price > 0) return false;
      if (priceFilter === "PAID" && (!ev.price || ev.price === 0)) return false;

      return true;
    });
  }, [events, search, city, category, priceFilter]);

  const clearAllFilters = () => {
    setSearch("");
    setCity("");
    setCategory("");
    setPriceFilter("ALL");
    setSearchParams({});
  };

  return (
    <div className="mx-auto max-w-[1440px] px-4 sm:px-8 lg:px-12 py-10">
      {/* Page Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#E31824]">
            LIVE ENTERTAINMENT
          </span>
          <h1 className="font-display text-4xl sm:text-5xl font-black uppercase tracking-tight text-white mt-1">
            EXPLORE EVENTS
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Discover concerts, comedy shows, nightlife, festivals and workshops.
          </p>
        </div>

        <div className="text-xs text-slate-400 font-semibold">
          Showing <span className="text-white font-bold">{filteredEvents.length}</span> events
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 rounded-2xl border border-white/10 bg-[#161224] p-4 shadow-xl">
        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-3 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search events..."
            className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:border-[#E31824] focus:outline-none"
          />
        </div>

        {/* City Filter */}
        <div className="relative">
          <MapPin size={16} className="absolute left-3.5 top-3 text-[#E31824]" />
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-xs font-semibold text-white focus:border-[#E31824] focus:outline-none cursor-pointer"
          >
            <option value="" className="bg-[#161224] text-white">
              All Locations
            </option>
            {CITY_OPTIONS.map((c) => (
              <option key={c} value={c} className="bg-[#161224] text-white">
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Category Filter */}
        <div className="relative">
          <Layers size={16} className="absolute left-3.5 top-3 text-purple-400" />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-xs font-semibold text-white focus:border-[#E31824] focus:outline-none cursor-pointer"
          >
            <option value="" className="bg-[#161224] text-white">
              All Categories
            </option>
            {categories.map((cat) => (
              <option key={cat} value={cat} className="bg-[#161224] text-white">
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Pricing Segment */}
        <div className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 p-1">
          {(["ALL", "FREE", "PAID"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPriceFilter(p)}
              className={`flex-1 rounded-lg py-1.5 text-[11px] font-bold uppercase transition ${
                priceFilter === p
                  ? "bg-[#E31824] text-white shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Active filters pill list */}
      {(search || city || category || priceFilter !== "ALL") && (
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Active Filters:</span>
          {search && (
            <span className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs text-white">
              "{search}"
              <button onClick={() => setSearch("")}><X size={12} /></button>
            </span>
          )}
          {city && (
            <span className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs text-white">
              {city}
              <button onClick={() => setCity("")}><X size={12} /></button>
            </span>
          )}
          {category && (
            <span className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs text-white">
              {category}
              <button onClick={() => setCategory("")}><X size={12} /></button>
            </span>
          )}
          {priceFilter !== "ALL" && (
            <span className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs text-white">
              {priceFilter} Tickets
              <button onClick={() => setPriceFilter("ALL")}><X size={12} /></button>
            </span>
          )}
          <button
            onClick={clearAllFilters}
            className="text-xs font-bold text-[#E31824] hover:underline ml-2"
          >
            Reset All
          </button>
        </div>
      )}

      {/* Events Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-72 rounded-2xl bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-[#161224] p-16 text-center">
          <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-red-600/10 text-[#E31824] mb-4">
            <Search size={32} />
          </div>
          <h3 className="font-display text-2xl font-bold uppercase text-white">
            No Events Match Your Filters
          </h3>
          <p className="mt-2 text-sm text-slate-400 max-w-md mx-auto">
            Try adjusting your search keywords, clearing your location filters, or checking back soon.
          </p>
          <button
            onClick={clearAllFilters}
            className="mt-6 rounded-xl bg-[#E31824] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-md hover:bg-[#c8141f]"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}
