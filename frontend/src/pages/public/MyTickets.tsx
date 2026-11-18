import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Ticket, Calendar, MapPin, QrCode, AlertCircle, RefreshCw } from "lucide-react";
import { ticketService, type TicketWithEvent } from "../../services/ticket.service";
import { useAuth } from "../../context/AuthContext";

export default function MyTickets() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<TicketWithEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedTicket, setSelectedTicket] = useState<TicketWithEvent | null>(null);

  const fetchTickets = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError("");
      const data = await ticketService.getMyTickets();
      setTickets(data);
    } catch (err: any) {
      setError(err.message || "Failed to load tickets.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [user]);

  if (!user) {
    return (
      <div className="mx-auto max-w-xl py-24 px-4 text-center">
        <Ticket size={48} className="mx-auto text-[#E31824] mb-4" />
        <h2 className="font-display text-3xl font-bold uppercase text-white">
          Sign In to Access Your Tickets
        </h2>
        <p className="mt-2 text-sm text-white/50">
          Access your digital entry passes and event QR check-in codes.
        </p>
        <Link
          to="/login"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#E31824] px-6 py-3 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-[#c8141f]"
        >
          Sign In Now
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold uppercase tracking-tight text-white">
            My Tickets
          </h1>
          <p className="mt-1 text-sm text-white/50">
            Show these passes at the entrance for verification.
          </p>
        </div>
        <button
          onClick={fetchTickets}
          disabled={loading}
          className="flex items-center gap-2 self-start rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white/80 transition hover:bg-white/10 disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <div className="size-8 animate-spin rounded-full border-2 border-white/20 border-t-[#E31824]" />
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-center">
          <AlertCircle size={32} className="mx-auto text-red-500 mb-2" />
          <p className="text-sm font-semibold text-red-400">{error}</p>
          <button
            onClick={fetchTickets}
            className="mt-4 rounded-xl bg-[#E31824] px-5 py-2 text-xs font-bold text-white transition hover:bg-[#c8141f]"
          >
            Try Again
          </button>
        </div>
      ) : tickets.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-[#121216] p-12 text-center">
          <Ticket size={48} className="mx-auto text-white/20 mb-4" />
          <h3 className="text-lg font-bold text-white">No Tickets Found</h3>
          <p className="mt-1 text-sm text-white/40">
            Tickets are generated once your booking is confirmed and paid.
          </p>
          <Link
            to="/events"
            className="mt-6 inline-block rounded-xl bg-[#E31824] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-[#c8141f]"
          >
            Explore Events
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              className="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-[#121216] p-6 transition hover:border-[#E31824]/40"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[#E31824]">
                    {ticket.id}
                  </span>
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
                {ticket.qrToken && (
                  <button
                    onClick={() => setSelectedTicket(ticket)}
                    className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/10"
                  >
                    <QrCode size={14} className="text-[#E31824]" />
                    <span>View QR Pass</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* QR Code Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl border border-white/15 bg-[#18181F] p-6 text-center shadow-2xl">
            <h3 className="text-lg font-bold text-white">Digital Entry Pass</h3>
            <p className="mt-1 text-xs text-white/60">{selectedTicket.event?.title}</p>
            <div className="mt-6 flex justify-center rounded-2xl bg-white p-6">
              <div className="text-center font-mono text-xs font-bold text-black break-all">
                <QrCode size={160} className="mx-auto mb-2 text-black" />
                <span className="text-[10px] text-slate-500">{selectedTicket.qrToken}</span>
              </div>
            </div>
            <p className="mt-4 text-[10px] text-white/40">
              Show this QR code at the venue gate for check-in scan.
            </p>
            <button
              onClick={() => setSelectedTicket(null)}
              className="mt-6 w-full rounded-xl bg-white/10 py-2.5 text-xs font-bold text-white transition hover:bg-white/20"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
