import { Link } from "react-router-dom";
import { Edit3 } from "lucide-react";
import type { EventItem } from "../../types/content";

interface EventTableProps {
  events: EventItem[];
}

export default function EventTable({ events }: EventTableProps) {
  return (
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
                  {ev.venue}, {ev.city}
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
  );
}
