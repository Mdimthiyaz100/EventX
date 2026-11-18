import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { PlusCircle, Calendar, MapPin, Edit3, AlertCircle } from "lucide-react";
import { organizerService } from "../../services/organizer.service";
import type { EventItem } from "../../types/content";

export default function MyEvents() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await organizerService.getMyEvents();
      setEvents(data || []);
    } catch (err: any) {
      setError(err.message || "Failed to load events.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold uppercase tracking-tight text-white">
            My Events
          </h1>
          <p className="mt-1 text-xs text-white/50">
            View, edit, and monitor your submitted event listings.
          </p>
        </div>
        <Link
          to="/organizer/events/create"
          className="inline-flex items-center gap-2 rounded-xl bg-[#E31824] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-[#c8141f]"
        >
          <PlusCircle size={15} /> Create Event
        </Link>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-xs font-semibold text-red-400">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <div className="size-8 animate-spin rounded-full border-2 border-white/20 border-t-[#E31824]" />
        </div>
      ) : events.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-[#121216] p-12 text-center">
          <Calendar size={44} className="mx-auto text-white/20 mb-3" />
          <h3 className="text-base font-bold text-white">No Events Created Yet</h3>
          <p className="mt-1 text-xs text-white/40">
            You have not created any events under this organizer account.
          </p>
          <Link
            to="/organizer/events/create"
            className="mt-5 inline-block rounded-xl bg-[#E31824] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white"
          >
            Create Your First Event
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#121216]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/10 bg-white/[0.02] text-white/40">
                <tr>
                  <th className="py-3 px-4 font-bold uppercase">Event Details</th>
                  <th className="py-3 px-4 font-bold uppercase">Category</th>
                  <th className="py-3 px-4 font-bold uppercase">Location</th>
                  <th className="py-3 px-4 font-bold uppercase">Date & Time</th>
                  <th className="py-3 px-4 font-bold uppercase">Status</th>
                  <th className="py-3 px-4 text-right font-bold uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-white/80">
                {events.map((ev) => (
                  <tr key={ev.id} className="hover:bg-white/[0.02]">
                    <td className="py-4 px-4 font-medium text-white">
                      <div>
                        <div className="font-bold">{ev.title}</div>
                        <div className="font-mono text-[10px] text-white/30">{ev.id}</div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-white/60">{ev.category}</td>
                    <td className="py-4 px-4 text-white/60">
                      <div className="flex items-center gap-1">
                        <MapPin size={12} className="text-[#E31824]" />
                        <span>{ev.venue}, {ev.city}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-white/60">
                      {new Date(ev.startAt).toLocaleString()}
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          ev.status === "PUBLISHED"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-amber-500/10 text-amber-400"
                        }`}
                      >
                        {ev.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <Link
                        to={`/organizer/events/${ev.id}/edit`}
                        className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-semibold text-white/90 hover:bg-white/10"
                      >
                        <Edit3 size={13} />
                        <span>Edit</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
