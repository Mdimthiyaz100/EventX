import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Ticket, Calendar, MapPin, ArrowRight } from "lucide-react";
import { apiGet } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

interface BookingRecord {
  id: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "EXPIRED";
  totalAmount: number | string;
  currency: string;
  createdAt: string;
  event: {
    id: string;
    title: string;
    city: string;
    startAt: string;
    imageUrl?: string;
  };
  items: Array<{
    id: string;
    quantity: number;
    ticketType: {
      name: string;
      price: number | string;
    };
  }>;
}

export default function MyBookings() {
  const { user } = useAuth();

  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function fetchBookings() {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const data = await apiGet("/bookings/mine");
        if (mounted && Array.isArray(data)) {
          setBookings(data as BookingRecord[]);
        }
      } catch (err: any) {
        if (mounted) setError(err.message || "Failed to load your bookings.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchBookings();
    return () => {
      mounted = false;
    };
  }, [user]);

  if (!user) {
    return (
      <div className="mx-auto max-w-xl py-24 px-4 text-center">
        <Ticket size={48} className="mx-auto text-[#E31824] mb-4" />
        <h2 className="font-display text-3xl font-bold uppercase text-white">
          Sign In to Access Your Bookings
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          View your confirmed e-tickets, QR passes, and transaction invoices.
        </p>
        <Link
          to="/login"
          className="mt-6 inline-block rounded-xl bg-[#E31824] px-6 py-2.5 text-xs font-bold uppercase text-white"
        >
          Sign In as User
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1440px] px-4 sm:px-8 lg:px-12 py-10">
      <div className="mb-8 border-b border-white/10 pb-6">
        <span className="text-xs font-bold uppercase tracking-widest text-[#E31824]">
          ACCOUNT DASHBOARD
        </span>
        <h1 className="font-display text-4xl sm:text-5xl font-black uppercase tracking-tight text-white mt-1">
          MY BOOKINGS
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Review all confirmed passes, event schedules, and booking reference IDs.
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 rounded-2xl bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-center text-xs text-red-400">
          {error}
        </div>
      ) : bookings.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-[#161224] p-16 text-center">
          <Ticket size={48} className="mx-auto text-slate-600 mb-4" />
          <h3 className="font-display text-2xl font-bold uppercase text-white">
            No Bookings Yet
          </h3>
          <p className="mt-2 text-sm text-slate-400 max-w-sm mx-auto">
            You haven't reserved any tickets yet. Browse trending events, comedy shows, or movies.
          </p>
          <Link
            to="/events"
            className="mt-6 inline-block rounded-xl bg-[#E31824] px-6 py-2.5 text-xs font-bold uppercase text-white hover:bg-[#c8141f]"
          >
            Explore Events &rarr;
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {bookings.map((b) => {
            const dateStr = b.event?.startAt
              ? new Intl.DateTimeFormat("en-IN", {
                  dateStyle: "medium",
                  timeStyle: "short",
                }).format(new Date(b.event.startAt))
              : "Date TBA";

            const statusColors = {
              CONFIRMED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
              PENDING: "bg-amber-500/10 text-amber-400 border-amber-500/30",
              CANCELLED: "bg-red-500/10 text-red-400 border-red-500/30",
              EXPIRED: "bg-slate-500/10 text-slate-400 border-slate-500/30",
            };

            return (
              <div
                key={b.id}
                className="overflow-hidden rounded-2xl border border-white/10 bg-[#161224] p-5 sm:p-6 shadow-xl backdrop-blur-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                  <div className="grid size-16 shrink-0 place-items-center rounded-2xl bg-red-600/10 text-[#E31824]">
                    <Ticket size={28} />
                  </div>

                  <div>
                    <div className="flex items-center gap-3 mb-1.5">
                      <span className="font-mono text-xs font-bold text-slate-400">
                        #{b.id}
                      </span>
                      <span
                        className={`rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          statusColors[b.status] || ""
                        }`}
                      >
                        {b.status}
                      </span>
                    </div>

                    <h3 className="font-display text-xl font-bold uppercase text-white">
                      {b.event?.title || "Event Pass"}
                    </h3>

                    <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <Calendar size={13} className="text-slate-400" />
                        <span>{dateStr}</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin size={13} className="text-[#E31824]" />
                        <span>{b.event?.city || "Venue"}</span>
                      </span>
                    </div>

                    {/* Ticket Items */}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {b.items?.map((item) => (
                        <span
                          key={item.id}
                          className="rounded-lg bg-white/5 border border-white/5 px-2.5 py-1 text-xs text-slate-300"
                        >
                          {item.quantity} × {item.ticketType.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex md:flex-col items-center md:items-end justify-between w-full md:w-auto border-t md:border-t-0 border-white/10 pt-4 md:pt-0">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400">
                    Total Paid
                  </span>
                  <span className="font-display text-2xl font-black text-[#E31824]">
                    {new Intl.NumberFormat("en-IN", {
                      style: "currency",
                      currency: "INR",
                      maximumFractionDigits: 0,
                    }).format(Number(b.totalAmount))}
                  </span>

                  <Link
                    to={`/events/${b.event?.id}`}
                    className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-slate-300 hover:text-white"
                  >
                    <span>Event Details</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
