import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Calendar, MapPin, AlertCircle } from "lucide-react";
import { bookingService, type BookingResponse } from "../../services/booking.service";

export default function BookingDetails() {
  const { id } = useParams<{ id: string }>();
  const [booking, setBooking] = useState<BookingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const myBookings = await bookingService.listMyBookings();
        const found = myBookings.find((b) => b.id === id);
        if (found) {
          setBooking(found);
        } else {
          setError("Booking not found or access denied.");
        }
      } catch (err: any) {
        setError(err.message || "Failed to load booking.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-2 border-white/20 border-t-[#E31824]" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="mb-6 flex items-center gap-3">
        <Link
          to="/my-bookings"
          className="grid size-9 place-items-center rounded-xl border border-white/10 bg-white/5 text-white/60 hover:text-white"
        >
          <ArrowLeft size={16} />
        </Link>
        <h1 className="font-display text-2xl font-bold uppercase tracking-tight text-white">
          Booking Details
        </h1>
      </div>

      {error || !booking ? (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-center">
          <AlertCircle size={32} className="mx-auto text-red-500 mb-2" />
          <p className="text-sm font-semibold text-red-400">{error || "Booking not found."}</p>
        </div>
      ) : (
        <div className="rounded-3xl border border-white/10 bg-[#121216] p-8 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <span className="font-mono text-xs font-bold text-[#E31824]">{booking.id}</span>
              <h2 className="text-lg font-bold text-white mt-1">
                {booking.event?.title || "Event Booking"}
              </h2>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${
                booking.status === "PAID"
                  ? "bg-emerald-500/10 text-emerald-400"
                  : booking.status === "PENDING"
                  ? "bg-amber-500/10 text-amber-400"
                  : "bg-red-500/10 text-red-400"
              }`}
            >
              {booking.status}
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 text-xs text-white/60">
            {booking.event?.venue && (
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-[#E31824]" />
                <span>{booking.event.venue}, {booking.event.city}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-white/40" />
              <span>Booked on {new Date(booking.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="border-t border-white/10 pt-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
              Tickets ({booking.tickets?.length || 0})
            </h3>
            <div className="space-y-2">
              {booking.tickets?.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-3 text-xs"
                >
                  <div>
                    <span className="font-mono font-bold text-[#E31824]">{t.id}</span>
                    <span className="ml-2 text-white/80">{t.ticketType?.name || "Pass"}</span>
                  </div>
                  <span className="font-bold text-white">₹{t.price}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-white/10 pt-4">
            <span className="text-xs font-bold uppercase text-white/40">Total Charged</span>
            <span className="font-display text-xl font-bold text-white">₹{booking.totalAmount}</span>
          </div>
        </div>
      )}
    </div>
  );
}
