import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Ticket, Calendar, MapPin, ArrowRight, XCircle, AlertCircle, RefreshCw } from "lucide-react";
import { bookingService, type BookingResponse } from "../../services/booking.service";
import { useAuth } from "../../context/AuthContext";

export default function MyBookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionBusy, setActionBusy] = useState<string | null>(null);

  const fetchBookings = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError("");
      const data = await bookingService.listMyBookings();
      setBookings(data || []);
    } catch (err: any) {
      setError(err.message || "Failed to load your bookings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [user]);

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;
    try {
      setActionBusy(bookingId);
      await bookingService.cancelBooking(bookingId);
      await fetchBookings();
    } catch (err: any) {
      alert(err.message || "Failed to cancel booking.");
    } finally {
      setActionBusy(null);
    }
  };

  if (!user) {
    return (
      <div className="mx-auto max-w-xl py-24 px-4 text-center">
        <Ticket size={48} className="mx-auto text-[#E31824] mb-4" />
        <h2 className="font-display text-3xl font-bold uppercase text-white">
          Sign In to Access Your Bookings
        </h2>
        <p className="mt-2 text-sm text-white/50">
          View all your booked event and movie tickets in one place.
        </p>
        <Link
          to="/login"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#E31824] px-6 py-3 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-[#c8141f]"
        >
          Sign In Now <ArrowRight size={14} />
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold uppercase tracking-tight text-white">
            My Bookings
          </h1>
          <p className="mt-1 text-sm text-white/50">
            View booking status, ticket passes, and order history.
          </p>
        </div>
        <button
          onClick={fetchBookings}
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
            onClick={fetchBookings}
            className="mt-4 rounded-xl bg-[#E31824] px-5 py-2 text-xs font-bold text-white transition hover:bg-[#c8141f]"
          >
            Try Again
          </button>
        </div>
      ) : bookings.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-[#121216] p-12 text-center">
          <Ticket size={48} className="mx-auto text-white/20 mb-4" />
          <h3 className="text-lg font-bold text-white">No Bookings Found</h3>
          <p className="mt-1 text-sm text-white/40">
            You haven't made any bookings yet. Explore upcoming events or movies to get started!
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <Link
              to="/events"
              className="rounded-xl bg-[#E31824] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-[#c8141f]"
            >
              Explore Events
            </Link>
            <Link
              to="/movies"
              className="rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-white/10"
            >
              Browse Movies
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="flex flex-col md:flex-row md:items-center justify-between gap-6 rounded-2xl border border-white/10 bg-[#121216] p-6 transition hover:border-white/20"
            >
              <div className="flex items-start gap-4">
                {booking.event?.imageUrl ? (
                  <img
                    src={booking.event.imageUrl}
                    alt={booking.event.title}
                    className="size-20 rounded-xl object-cover"
                  />
                ) : (
                  <div className="flex size-20 items-center justify-center rounded-xl bg-white/5 text-[#E31824]">
                    <Ticket size={28} />
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#E31824]">
                      {booking.id}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
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
                  <h3 className="mt-1 text-base font-bold text-white">
                    {booking.event?.title || "Event Booking"}
                  </h3>
                  <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-white/50">
                    {booking.event?.venue && (
                      <span className="flex items-center gap-1">
                        <MapPin size={13} /> {booking.event.venue}, {booking.event.city}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar size={13} /> {new Date(booking.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-end md:items-center justify-between md:justify-end gap-4 border-t border-white/5 pt-4 md:border-0 md:pt-0">
                <div className="text-right">
                  <div className="text-[10px] font-bold uppercase text-white/40">Total Amount</div>
                  <div className="text-lg font-bold text-white">₹{booking.totalAmount}</div>
                  <div className="text-[10px] text-white/40">
                    {booking.tickets?.length || 0} tickets
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    to={`/my-tickets`}
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/10"
                  >
                    View Tickets
                  </Link>
                  {booking.status === "PENDING" && (
                    <button
                      onClick={() => handleCancelBooking(booking.id)}
                      disabled={actionBusy === booking.id}
                      className="flex items-center gap-1 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-400 transition hover:bg-red-500/20 disabled:opacity-50"
                    >
                      <XCircle size={14} />
                      {actionBusy === booking.id ? "Cancelling…" : "Cancel"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
