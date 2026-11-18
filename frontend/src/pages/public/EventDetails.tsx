import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Calendar,
  MapPin,
  ShieldCheck,
  Heart,
  Share2,
  Ticket,
  AlertCircle,
  CheckCircle2,
  Minus,
  Plus,
  ArrowLeft
} from "lucide-react";
import { apiGet } from "../../services/api";
import { bookingService } from "../../services/booking.service";
import { paymentService } from "../../services/payment.service";
import type { EventItem } from "../../types/content";
import { useAuth } from "../../context/AuthContext";
import { useWishlist } from "../../context/WishlistContext";

export default function EventDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isWishlisted, toggleWishlist } = useWishlist();

  const [event, setEvent] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Booking Quantities state: { [ticketTypeId]: number }
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [bookingBusy, setBookingBusy] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function loadEvent() {
      if (!id) return;
      try {
        setLoading(true);
        const data = await apiGet(`/events/${id}`);
        if (mounted && data) {
          setEvent(data as EventItem);
        }
      } catch (err: any) {
        if (mounted) setError(err.message || "Failed to load event details.");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadEvent();
    return () => {
      mounted = false;
    };
  }, [id]);

  const updateQuantity = (tierId: string, delta: number, maxCapacity: number) => {
    setQuantities((prev) => {
      const current = prev[tierId] || 0;
      const next = Math.max(0, Math.min(10, Math.min(maxCapacity, current + delta)));
      return { ...prev, [tierId]: next };
    });
  };

  // Calculate order total
  const selectedItems = Object.entries(quantities)
    .filter(([_, qty]) => qty > 0)
    .map(([tierId, qty]) => {
      const tier = event?.ticketTypes?.find((t) => t.id === tierId);
      return {
        ticketTypeId: tierId,
        name: tier?.name || "Pass",
        price: Number(tier?.price || 0),
        quantity: qty,
      };
    });

  const totalAmount = selectedItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const totalCount = selectedItems.reduce((sum, item) => sum + item.quantity, 0);

  const [idempotencyKey, setIdempotencyKey] = useState<string>("");

  // Handle Ticket Booking
  const handleCheckout = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (totalCount === 0) {
      setBookingError("Please select at least 1 ticket to book.");
      return;
    }

    setBookingError("");
    setBookingBusy(true);

    // Reuse idempotency key for retries of the same booking attempt
    const currentKey = idempotencyKey || (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `idemp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`);
    if (!idempotencyKey) {
      setIdempotencyKey(currentKey);
    }

    try {
      const bookingPayload = {
        eventId: event!.id,
        items: selectedItems.map((item) => ({
          ticketTypeId: item.ticketTypeId,
          quantity: item.quantity,
        })),
      };

      const result = await bookingService.createBooking(bookingPayload, currentKey);
      
      // Optionally request payment link if supported
      try {
        if (result && result.id) {
          const paymentLink = await paymentService.createPaymentLink(result.id);
          if (paymentLink && paymentLink.paymentUrl) {
            window.location.href = paymentLink.paymentUrl;
            return;
          }
        }
      } catch {
        // Fall back to showing confirmed booking ID directly if payment provider is in test/mock mode
      }

      setBookingSuccess(result?.id || "CONFIRMED");
      setQuantities({});
      setIdempotencyKey("");
    } catch (err: any) {
      setBookingError(err.message || "Booking failed. Please try again.");
    } finally {
      setBookingBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-2 border-white/20 border-t-[#E31824]" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="mx-auto max-w-xl py-24 px-4 text-center">
        <AlertCircle size={40} className="mx-auto text-red-500 mb-3" />
        <h2 className="font-display text-2xl font-bold uppercase text-white">Event Not Found</h2>
        <p className="mt-2 text-sm text-slate-400">{error || "This event may be unpublished or removed."}</p>
        <Link
          to="/events"
          className="mt-6 inline-block rounded-xl bg-[#E31824] px-6 py-2.5 text-xs font-bold uppercase text-white"
        >
          &larr; Back to Events
        </Link>
      </div>
    );
  }

  const wishlisted = isWishlisted(event.id);
  const formattedDate = new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(event.startDate || event.startAt));

  const formattedTime = new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  }).format(new Date(event.startDate || event.startAt));

  return (
    <div className="relative pb-24">
      {/* 1. HERO BANNER BACKDROP */}
      <div className="relative h-[340px] sm:h-[420px] lg:h-[480px] w-full overflow-hidden bg-slate-950">
        {event.imageUrl ? (
          <img
            src={event.imageUrl}
            alt={event.title}
            className="size-full object-cover filter brightness-65 scale-105"
          />
        ) : (
          <div className="size-full bg-gradient-to-br from-[#1b152e] to-[#0A0713]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0713] via-[#0A0713]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A0713]/90 via-transparent to-[#0A0713]/90" />

        <div className="absolute top-6 left-5 sm:left-12 z-20">
          <Link
            to="/events"
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/40 px-4 py-1.5 text-xs font-semibold text-slate-200 backdrop-blur-md hover:bg-black/70 hover:text-white"
          >
            <ArrowLeft size={14} />
            <span>Back to Events</span>
          </Link>
        </div>
      </div>

      {/* 2. MAIN EVENT CONTENT GRID */}
      <div className="relative z-10 mx-auto max-w-[1440px] px-4 sm:px-8 lg:px-12 -mt-32">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT 2 COLUMNS: EVENT DETAILS */}
          <div className="lg:col-span-2 space-y-8">
            <div className="rounded-3xl border border-white/10 bg-[#161224]/90 p-6 sm:p-10 backdrop-blur-xl shadow-2xl">
              {/* Category & Status */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <span className="rounded-md border border-purple-500/40 bg-purple-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-purple-300">
                  {event.category}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleWishlist(event.id)}
                    className="grid size-10 place-items-center rounded-xl border border-white/10 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10"
                    title="Wishlist"
                  >
                    <Heart
                      size={18}
                      className={wishlisted ? "fill-[#E31824] text-[#E31824]" : ""}
                    />
                  </button>
                  <button
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({ title: event.title, url: window.location.href });
                      } else {
                        navigator.clipboard.writeText(window.location.href);
                        alert("Link copied to clipboard!");
                      }
                    }}
                    className="grid size-10 place-items-center rounded-xl border border-white/10 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10"
                    title="Share"
                  >
                    <Share2 size={18} />
                  </button>
                </div>
              </div>

              {/* Event Title */}
              <h1 className="font-display text-3xl sm:text-5xl font-black uppercase tracking-tight text-white leading-tight">
                {event.title}
              </h1>

              {/* Quick Info Badges */}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 border-y border-white/10 py-5">
                <div className="flex items-start gap-3">
                  <div className="grid size-10 place-items-center rounded-xl bg-red-600/10 text-[#E31824]">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <span className="block text-xs font-medium text-slate-400">Date & Time</span>
                    <span className="text-sm font-bold text-white">{formattedDate}</span>
                    <span className="block text-xs text-slate-400">{formattedTime} onwards</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="grid size-10 place-items-center rounded-xl bg-red-600/10 text-[#E31824]">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <span className="block text-xs font-medium text-slate-400">Venue</span>
                    <span className="text-sm font-bold text-white">{event.venue}</span>
                    <span className="block text-xs text-slate-400">{event.city}</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mt-8">
                <h3 className="font-display text-xl font-bold uppercase tracking-wider text-white mb-3">
                  About the Event
                </h3>
                <div className="whitespace-pre-line text-sm leading-relaxed text-slate-300">
                  {event.description}
                </div>
              </div>

              {/* Trust Badges */}
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-2xl bg-white/5 p-4 border border-white/5">
                <div className="flex items-center gap-2.5 text-xs text-slate-300">
                  <ShieldCheck size={18} className="text-emerald-400 shrink-0" />
                  <span>100% Verified Event & Official Tickets</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-300">
                  <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
                  <span>Instant E-Ticket Delivery via Email & App</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT 1 COLUMN: TICKET BOOKING PANEL */}
          <div className="space-y-6">
            <div className="sticky top-24 rounded-3xl border border-white/10 bg-[#161224] p-6 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-widest text-[#E31824]">
                    TICKETING
                  </span>
                  <h3 className="font-display text-2xl font-black uppercase tracking-tight text-white">
                    Select Tickets
                  </h3>
                </div>
                <Ticket size={24} className="text-slate-400" />
              </div>

              {bookingSuccess && (
                <div className="mb-6 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-center">
                  <CheckCircle2 size={32} className="mx-auto text-emerald-400 mb-2" />
                  <p className="font-display text-lg font-bold uppercase text-white">
                    Booking Confirmed!
                  </p>
                  <p className="text-xs text-slate-300 mt-1">
                    Booking ID: <strong className="text-emerald-400">{bookingSuccess}</strong>
                  </p>
                  <Link
                    to="/my-bookings"
                    className="mt-4 block w-full rounded-xl bg-emerald-600 py-2.5 text-xs font-bold uppercase text-white hover:bg-emerald-500 transition"
                  >
                    View in My Bookings &rarr;
                  </Link>
                </div>
              )}

              {bookingError && (
                <div className="mb-4 rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-400">
                  {bookingError}
                </div>
              )}

              {/* Ticket Tiers List */}
              <div className="space-y-3">
                {event.ticketTypes && event.ticketTypes.length > 0 ? (
                  event.ticketTypes.map((tier) => {
                    const priceNum = Number(tier.price);
                    const qty = quantities[tier.id] || 0;
                    const available = tier.capacity - (tier.sold || 0);

                    return (
                      <div
                        key={tier.id}
                        className={`rounded-2xl border p-3.5 transition ${
                          qty > 0
                            ? "border-[#E31824] bg-red-600/5"
                            : "border-white/10 bg-white/5"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-display text-base font-bold text-white block">
                              {tier.name}
                            </span>
                            <span className="text-xs font-extrabold text-[#E31824]">
                              {priceNum === 0
                                ? "FREE"
                                : new Intl.NumberFormat("en-IN", {
                                    style: "currency",
                                    currency: "INR",
                                    maximumFractionDigits: 0,
                                  }).format(priceNum)}
                            </span>
                          </div>

                          {/* Stepper */}
                          <div className="flex items-center gap-2">
                            <button
                              disabled={qty <= 0}
                              onClick={() => updateQuantity(tier.id, -1, available)}
                              className="grid size-8 place-items-center rounded-lg border border-white/15 bg-white/10 text-white disabled:opacity-30 hover:bg-white/20"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="w-6 text-center text-sm font-bold text-white">
                              {qty}
                            </span>
                            <button
                              disabled={qty >= available || qty >= 10}
                              onClick={() => updateQuantity(tier.id, 1, available)}
                              className="grid size-8 place-items-center rounded-lg border border-white/15 bg-white/10 text-white disabled:opacity-30 hover:bg-white/20"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>

                        <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                          <span>Max 10 per booking</span>
                          <span>{available > 0 ? `${available} left` : "Sold Out"}</span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="rounded-xl bg-white/5 p-4 text-center text-xs text-slate-400">
                    Free General Admission (Walk-in Entry)
                  </div>
                )}
              </div>

              {/* Order Summary & CTA */}
              <div className="mt-6 border-t border-white/10 pt-4">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Selected Tickets:</span>
                  <span className="font-bold text-white">{totalCount} pass(es)</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-sm font-semibold text-white">
                  <span>Total Amount:</span>
                  <span className="font-display text-xl font-black text-[#E31824]">
                    {new Intl.NumberFormat("en-IN", {
                      style: "currency",
                      currency: "INR",
                      maximumFractionDigits: 0,
                    }).format(totalAmount)}
                  </span>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={bookingBusy || totalCount === 0}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#E31824] py-3.5 text-xs font-extrabold uppercase tracking-wider text-white shadow-lg shadow-red-600/30 transition hover:bg-[#c8141f] active:scale-[0.98] disabled:opacity-50"
                >
                  {bookingBusy ? (
                    <>
                      <div className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>Processing Booking…</span>
                    </>
                  ) : (
                    <span>
                      {user ? `Book ${totalCount} Tickets Now` : "Sign In to Book Tickets"}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
