import { useState, useEffect } from "react";
import { Ticket, Users, AlertCircle, RefreshCw } from "lucide-react";
import { organizerService, type AttendeeItem } from "../../services/organizer.service";
import type { EventItem } from "../../types/content";

export default function OrganizerBookings() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [attendees, setAttendees] = useState<AttendeeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingAttendees, setLoadingAttendees] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await organizerService.getMyEvents();
        setEvents(data || []);
        if (data && data.length > 0) {
          setSelectedEventId(data[0].id);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load events.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const fetchAttendees = async (eventId: string) => {
    if (!eventId) return;
    try {
      setLoadingAttendees(true);
      setError("");
      const data = await organizerService.getAttendees(eventId);
      setAttendees(data || []);
    } catch (err: any) {
      setError(err.message || "Failed to load attendees.");
    } finally {
      setLoadingAttendees(false);
    }
  };

  useEffect(() => {
    if (selectedEventId) {
      fetchAttendees(selectedEventId);
    }
  }, [selectedEventId]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold uppercase tracking-tight text-white">
            Bookings & Attendees
          </h1>
          <p className="mt-1 text-xs text-white/50">
            View tickets booked and entry status for your events.
          </p>
        </div>

        {events.length > 0 && (
          <div className="flex items-center gap-3">
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="rounded-xl border border-white/10 bg-[#121216] px-4 py-2 text-xs font-semibold text-white outline-none focus:border-[#E31824]"
            >
              {events.map((ev) => (
                <option key={ev.id} value={ev.id} className="bg-[#121216]">
                  {ev.title}
                </option>
              ))}
            </select>
            <button
              onClick={() => fetchAttendees(selectedEventId)}
              disabled={loadingAttendees}
              className="grid size-9 place-items-center rounded-xl border border-white/10 bg-white/5 text-white/70 hover:text-white"
            >
              <RefreshCw size={14} className={loadingAttendees ? "animate-spin" : ""} />
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-xs font-semibold text-red-400">
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
          <Ticket size={40} className="mx-auto text-white/20 mb-3" />
          <h3 className="text-base font-bold text-white">No Events Available</h3>
          <p className="mt-1 text-xs text-white/40">Create an event first to see bookings.</p>
        </div>
      ) : loadingAttendees ? (
        <div className="flex min-h-[30vh] items-center justify-center">
          <div className="size-8 animate-spin rounded-full border-2 border-white/20 border-t-[#E31824]" />
        </div>
      ) : attendees.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-[#121216] p-12 text-center">
          <Users size={40} className="mx-auto text-white/20 mb-3" />
          <h3 className="text-base font-bold text-white">No Booked Tickets Yet</h3>
          <p className="mt-1 text-xs text-white/40">
            Bookings made by customers for this event will appear here.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#121216]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/10 bg-white/[0.02] text-white/40">
                <tr>
                  <th className="py-3 px-4 font-bold uppercase">Ticket ID</th>
                  <th className="py-3 px-4 font-bold uppercase">Attendee Name</th>
                  <th className="py-3 px-4 font-bold uppercase">Email</th>
                  <th className="py-3 px-4 font-bold uppercase">Price</th>
                  <th className="py-3 px-4 font-bold uppercase">Status</th>
                  <th className="py-3 px-4 font-bold uppercase">Checked In At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-white/80">
                {attendees.map((att) => (
                  <tr key={att.id} className="hover:bg-white/[0.02]">
                    <td className="py-3.5 px-4 font-mono text-[11px] font-bold text-[#E31824]">
                      {att.id}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-white">
                      {att.user?.name || "Guest Attendee"}
                    </td>
                    <td className="py-3.5 px-4 text-white/60">{att.user?.email || "—"}</td>
                    <td className="py-3.5 px-4 text-white font-semibold">₹{att.price}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          att.status === "USED"
                            ? "bg-slate-500/10 text-slate-400"
                            : att.status === "ISSUED"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-red-500/10 text-red-400"
                        }`}
                      >
                        {att.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-white/50">
                      {att.usedAt ? new Date(att.usedAt).toLocaleString() : "Not Checked In"}
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
