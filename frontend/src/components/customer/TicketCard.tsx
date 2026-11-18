import { Calendar, MapPin, QrCode } from "lucide-react";
import type { TicketWithEvent } from "../../services/ticket.service";

interface TicketCardProps {
  ticket: TicketWithEvent;
  onViewQr?: (ticket: TicketWithEvent) => void;
}

export default function TicketCard({ ticket, onViewQr }: TicketCardProps) {
  return (
    <div className="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-[#121216] p-6 transition hover:border-[#E31824]/40">
      <div>
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs font-bold text-[#E31824]">{ticket.id}</span>
          <span
            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
              ticket.status === "USED"
                ? "bg-slate-500/10 text-slate-400"
                : ticket.status === "ISSUED"
                ? "bg-emerald-500/10 text-emerald-400"
                : "bg-red-500/10 text-red-400"
            }`}
          >
            {ticket.status}
          </span>
        </div>

        <h3 className="mt-3 text-lg font-bold text-white">
          {ticket.event?.title || "Event Pass"}
        </h3>

        <div className="mt-2 text-xs font-semibold text-[#E31824]">
          {ticket.ticketType?.name || "Standard Pass"} • ₹{ticket.price}
        </div>

        <div className="mt-4 space-y-1.5 text-xs text-white/60">
          {ticket.event?.venue && (
            <div className="flex items-center gap-1.5">
              <MapPin size={13} className="text-white/40" />
              <span>{ticket.event.venue}, {ticket.event.city}</span>
            </div>
          )}
          {ticket.event?.startAt && (
            <div className="flex items-center gap-1.5">
              <Calendar size={13} className="text-white/40" />
              <span>{new Date(ticket.event.startAt).toLocaleString()}</span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-dashed border-white/10 pt-4">
        <div className="text-[10px] text-white/40">
          Booking ref: <span className="font-mono text-white/60">{ticket.bookingId}</span>
        </div>
        {ticket.qrToken && onViewQr && (
          <button
            onClick={() => onViewQr(ticket)}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/10"
          >
            <QrCode size={14} className="text-[#E31824]" />
            <span>View QR Pass</span>
          </button>
        )}
      </div>
    </div>
  );
}
