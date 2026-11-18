import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Calendar, Ticket, PlusCircle, ArrowUpRight, TrendingUp, AlertCircle } from "lucide-react";
import { organizerService } from "../../services/organizer.service";
import type { EventItem } from "../../types/content";
import { useAuth } from "../../context/AuthContext";

export default function OrganizerDashboard() {
  const { user } = useAuth();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await organizerService.getMyEvents();
        setEvents(data || []);
      } catch (err: any) {
        setError(err.message || "Failed to load organizer dashboard.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const totalEvents = events.length;
  const publishedEvents = events.filter((e) => e.status === "PUBLISHED").length;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold uppercase tracking-tight text-white">
            Welcome back, {user?.name || "Organizer"}
          </h1>
          <p className="mt-1 text-sm text-white/50">
            Manage your live events, ticket inventory, and attendee check-ins.
          </p>
        </div>
        <Link
          to="/organizer/events/create"
          className="inline-flex items-center gap-2 rounded-xl bg-[#E31824] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-[#c8141f]"
        >
          <PlusCircle size={15} /> Create New Event
        </Link>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-xs font-semibold text-red-400">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-[#121216] p-6">
          <div className="flex items-center justify-between text-white/50">
            <span className="text-xs font-bold uppercase tracking-wider">Total Events</span>
            <Calendar size={18} className="text-[#E31824]" />
          </div>
          <div className="mt-4 text-3xl font-bold text-white">{loading ? "…" : totalEvents}</div>
          <div className="mt-1 text-xs text-white/40">Events under your management</div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#121216] p-6">
          <div className="flex items-center justify-between text-white/50">
            <span className="text-xs font-bold uppercase tracking-wider">Published & Active</span>
            <TrendingUp size={18} className="text-emerald-400" />
          </div>
          <div className="mt-4 text-3xl font-bold text-white">{loading ? "…" : publishedEvents}</div>
          <div className="mt-1 text-xs text-white/40">Live for discovery & booking</div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#121216] p-6">
          <div className="flex items-center justify-between text-white/50">
            <span className="text-xs font-bold uppercase tracking-wider">Check-in Terminal</span>
            <Ticket size={18} className="text-purple-400" />
          </div>
          <div className="mt-4 text-sm font-semibold text-white">QR Validation</div>
          <Link
            to="/organizer/tickets"
            className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-[#E31824] hover:underline"
          >
            Launch Entry Scanner <ArrowUpRight size={13} />
          </Link>
        </div>
      </div>

      {/* Events List Preview */}
      <div className="rounded-2xl border border-white/10 bg-[#121216] p-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <h2 className="text-base font-bold text-white">Your Events</h2>
          <Link
            to="/organizer/events"
            className="text-xs font-bold text-white/60 hover:text-white"
          >
            View All →
          </Link>
        </div>

        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="size-6 animate-spin rounded-full border-2 border-white/20 border-t-[#E31824]" />
          </div>
        ) : events.length === 0 ? (
          <div className="py-12 text-center">
            <Calendar size={36} className="mx-auto text-white/20 mb-3" />
            <p className="text-sm font-medium text-white/60">No events found.</p>
            <p className="mt-1 text-xs text-white/40">
              Get started by creating your first event listing.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {events.slice(0, 5).map((ev) => (
              <div key={ev.id} className="flex items-center justify-between py-4">
                <div>
                  <h3 className="text-sm font-bold text-white">{ev.title}</h3>
                  <div className="mt-1 flex items-center gap-3 text-xs text-white/50">
                    <span>{ev.city}</span>
                    <span>•</span>
                    <span>{new Date(ev.startAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      ev.status === "PUBLISHED"
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-amber-500/10 text-amber-400"
                    }`}
                  >
                    {ev.status}
                  </span>
                  <Link
                    to={`/organizer/events/${ev.id}/edit`}
                    className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/80 hover:bg-white/10"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
