import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { apiGet } from "../../services/api";
import type { EventItem } from "../../types/content";
import EventCard from "../../components/customer/EventCard";

export default function CategoryEvents() {
  const { categoryName } = useParams<{ categoryName: string }>();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function loadCategoryEvents() {
      if (!categoryName) return;
      try {
        setLoading(true);
        const data = await apiGet(`/events?limit=50&category=${encodeURIComponent(categoryName)}`);
        if (mounted && Array.isArray(data)) {
          setEvents(data as EventItem[]);
        }
      } catch (err) {
        console.error("Failed to load category events", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadCategoryEvents();
    return () => {
      mounted = false;
    };
  }, [categoryName]);

  return (
    <div className="mx-auto max-w-[1440px] px-4 sm:px-8 lg:px-12 py-10">
      <div className="mb-8 border-b border-white/10 pb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#E31824]">
            <Link to="/events" className="hover:underline">Events</Link>
            <span>/</span>
            <span>{categoryName}</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-black uppercase tracking-tight text-white mt-1">
            {categoryName}
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Browse all upcoming {categoryName?.toLowerCase()} in India.
          </p>
        </div>

        <Link
          to="/events"
          className="text-xs font-bold text-slate-400 hover:text-white transition"
        >
          &larr; All Categories
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-72 rounded-2xl bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-[#161224] p-16 text-center">
          <h3 className="font-display text-2xl font-bold uppercase text-white">
            No {categoryName} listed currently
          </h3>
          <p className="mt-2 text-sm text-slate-400">
            Check back later as new events are added daily by organizers.
          </p>
          <Link
            to="/events"
            className="mt-6 inline-block rounded-xl bg-[#E31824] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-md hover:bg-[#c8141f]"
          >
            Explore Other Events
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}
