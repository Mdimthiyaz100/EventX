import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  ShieldCheck,
  Heart,
  ChevronRight,
  ArrowLeft,
  Check,
} from "lucide-react";
import { apiGet } from "../../services/api";
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

  // Selected Category Tier
  const [selectedTierId, setSelectedTierId] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(2);
  const [activeTab, setActiveTab] = useState<"info" | "artist" | "venue" | "terms" | "similar">("info");

  useEffect(() => {
    let mounted = true;
    async function loadEvent() {
      if (!id) return;
      try {
        setLoading(true);
        const data = await apiGet(`/events/${id}`);
        if (mounted && data) {
          const evt = data as EventItem;
          setEvent(evt);
          if (evt.ticketTypes && evt.ticketTypes.length > 0) {
            setSelectedTierId(evt.ticketTypes[0].id);
          }
        }
      } catch (err: unknown) {
        if (mounted) {
          const msg = err instanceof Error ? err.message : "Failed to load event details.";
          setError(msg);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadEvent();
    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-[#000000] text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="size-8 animate-spin rounded-full border-2 border-white/20 border-t-[#ED1C24]" />
          <span className="text-xs font-semibold text-[#777777]">Loading event details…</span>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center text-white">
        <h2 className="text-xl font-bold">Event Not Found</h2>
        <p className="mt-2 text-sm text-[#777777]">{error || "The requested event could not be found."}</p>
        <Link
          to="/events"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#ED1C24] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white"
        >
          <ArrowLeft size={14} /> Back to Events
        </Link>
      </div>
    );
  }

  const selectedTier = event.ticketTypes?.find((t) => t.id === selectedTierId) || event.ticketTypes?.[0];
  const unitPrice = Number(selectedTier?.price || event.price || 1499);
  const subtotal = unitPrice * quantity;
  const convenienceFee = Math.round(subtotal * 0.05);
  const totalPayable = subtotal + convenienceFee;

  const handleProceedToSeats = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    navigate(`/events/${event.id}/seats?tier=${selectedTierId || "general"}&qty=${quantity}`);
  };

  return (
    <div className="min-h-screen bg-[#000000] text-white">
      {/* Breadcrumb row */}
      <div className="border-b border-[#292929] bg-[#0A0A0A]">
        <div className="mx-auto flex max-w-[1440px] items-center gap-2 px-4 py-3.5 text-xs text-[#777777] sm:px-8 lg:px-12">
          <Link to="/" className="hover:text-white">Home</Link>
          <ChevronRight size={13} />
          <Link to="/events" className="hover:text-white">Events</Link>
          <ChevronRight size={13} />
          <span className="text-white font-medium truncate max-w-xs">{event.title}</span>
        </div>
      </div>

      <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          {/* ================= LEFT / MAIN CONTENT (8 cols) ================= */}
          <div className="lg:col-span-8">
            {/* Event Hero Media Banner */}
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-3xl border border-[#292929] bg-[#111111]">
              <img
                src={event.imageUrl || "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=1600&q=80"}
                alt={event.title}
                className="size-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
              <button
                onClick={() => toggleWishlist(event.id)}
                className="absolute right-4 top-4 flex size-10 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md transition hover:bg-[#ED1C24]"
              >
                <Heart size={18} className={isWishlisted(event.id) ? "fill-[#ED1C24] text-[#ED1C24]" : ""} />
              </button>
            </div>

            {/* Title & Metadata */}
            <div className="mt-6">
              <span className="rounded bg-[#ED1C24] px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
                {event.category || "LIVE CONCERT"}
              </span>

              <h1 className="mt-3 font-display text-3xl sm:text-5xl font-black uppercase tracking-tight text-white">
                {event.title}
              </h1>

              {/* Event Attributes Row */}
              <div className="mt-4 flex flex-wrap items-center gap-6 text-xs font-semibold text-[#BDBDBD]">
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-[#ED1C24]" />
                  <span>
                    {event.startDate
                      ? new Date(event.startDate).toLocaleDateString("en-IN", {
                          weekday: "short",
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : "Date TBA"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-[#ED1C24]" />
                  <span>7:00 PM onwards</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-[#ED1C24]" />
                  <span>{event.location || event.city || "Venue TBA"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-[#ED1C24]" />
                  <span>Age: 6+ only</span>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="mt-8 flex items-center gap-2 border-b border-[#292929] pb-2 text-xs font-bold uppercase tracking-wider">
              {[
                { id: "info", label: "Event Info" },
                { id: "artist", label: "Artist" },
                { id: "venue", label: "Venue" },
                { id: "terms", label: "Terms & Conditions" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`rounded-lg px-4 py-2 transition ${
                    activeTab === tab.id
                      ? "bg-[#ED1C24] text-white"
                      : "text-[#777777] hover:bg-[#111111] hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Panels */}
            <div className="mt-6 text-sm leading-relaxed text-[#BDBDBD]">
              {activeTab === "info" && (
                <div className="space-y-4">
                  <h3 className="text-base font-bold text-white uppercase tracking-wide">About the Event</h3>
                  <p>{event.description || "Get ready for an adrenaline-fueled entertainment experience with top-tier stage production, dynamic lighting, and crystal-clear audio."}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                    <div className="rounded-xl border border-[#292929] bg-[#111111] p-4">
                      <h4 className="font-bold text-white text-xs uppercase text-[#ED1C24]">Highlights</h4>
                      <p className="mt-1 text-xs text-[#BDBDBD]">Exclusive fan pit zones, world-class acoustics, food & beverage counters available.</p>
                    </div>
                    <div className="rounded-xl border border-[#292929] bg-[#111111] p-4">
                      <h4 className="font-bold text-white text-xs uppercase text-[#ED1C24]">Parking & Access</h4>
                      <p className="mt-1 text-xs text-[#BDBDBD]">Dedicated valet and self-parking spaces with smooth entry gates.</p>
                    </div>
                  </div>
                </div>
              )}
              {activeTab === "artist" && (
                <div>
                  <h3 className="text-base font-bold text-white uppercase tracking-wide">Featured Performer</h3>
                  <p className="mt-2">Featuring acclaimed chart-topping musical artists delivering live signature renditions.</p>
                </div>
              )}
              {activeTab === "venue" && (
                <div>
                  <h3 className="text-base font-bold text-white uppercase tracking-wide">Venue Information</h3>
                  <p className="mt-2">{event.venue || event.location || "Venue details will be updated prior to the event."}</p>
                </div>
              )}
              {activeTab === "terms" && (
                <ul className="list-disc pl-5 space-y-1 text-xs text-[#777777]">
                  <li>Tickets once booked cannot be exchanged or refunded unless the event is officially cancelled.</li>
                  <li>Carrying alcohol, cigarettes, or hazardous materials is strictly prohibited inside the arena.</li>
                  <li>Government-issued photo identification is mandatory at entry verification.</li>
                </ul>
              )}
            </div>
          </div>

          {/* ================= RIGHT SIDEBAR: TICKET CONFIGURATOR (4 cols) ================= */}
          <div className="lg:col-span-4">
            <div className="sticky top-28 rounded-3xl border border-[#292929] bg-[#111111] p-6 shadow-2xl">
              <h2 className="font-display text-lg font-black uppercase tracking-wider text-white">
                Select Ticket Category
              </h2>

              {/* Tiers List */}
              <div className="mt-4 space-y-3">
                {event.ticketTypes && event.ticketTypes.length > 0 ? (
                  event.ticketTypes.map((tier) => {
                    const isSelected = selectedTierId === tier.id;
                    return (
                      <div
                        key={tier.id}
                        onClick={() => setSelectedTierId(tier.id)}
                        className={`cursor-pointer rounded-2xl border p-4 transition ${
                          isSelected
                            ? "border-[#ED1C24] bg-[#171717]"
                            : "border-[#292929] bg-[#0A0A0A] hover:border-[#777777]"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-bold text-sm text-white">{tier.name}</span>
                            <p className="text-[11px] text-[#777777]">Direct stage view & access</p>
                          </div>
                          <div className="text-right">
                            <span className="text-base font-extrabold text-[#ED1C24]">
                              ₹{Number(tier.price).toLocaleString("en-IN")}
                            </span>
                            <div className="mt-1 flex items-center justify-end">
                              <div
                                className={`size-4 rounded-full border flex items-center justify-center ${
                                  isSelected ? "border-[#ED1C24] bg-[#ED1C24]" : "border-[#777777]"
                                }`}
                              >
                                {isSelected && <Check size={10} className="text-white" />}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div
                    onClick={() => setSelectedTierId("general")}
                    className="cursor-pointer rounded-2xl border border-[#ED1C24] bg-[#171717] p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-sm text-white">General Admission</span>
                        <p className="text-[11px] text-[#777777]">Entry pass to general arena</p>
                      </div>
                      <span className="text-base font-extrabold text-[#ED1C24]">
                        ₹{(event.price ?? 1499).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Quantity selector */}
              <div className="mt-5 flex items-center justify-between rounded-xl border border-[#292929] bg-[#0A0A0A] px-4 py-3">
                <span className="text-xs font-semibold text-[#BDBDBD]">Quantity</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="flex size-7 items-center justify-center rounded-lg border border-[#292929] bg-[#111111] text-white hover:border-[#ED1C24]"
                  >
                    -
                  </button>
                  <span className="w-5 text-center text-sm font-bold">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                    className="flex size-7 items-center justify-center rounded-lg border border-[#292929] bg-[#111111] text-white hover:border-[#ED1C24]"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Price Calculation Box */}
              <div className="mt-5 space-y-2 border-t border-[#292929] pt-4 text-xs text-[#BDBDBD]">
                <div className="flex justify-between">
                  <span>Tickets ({quantity}x)</span>
                  <span className="text-white font-medium">₹{subtotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span>Convenience Fee</span>
                  <span className="text-white font-medium">₹{convenienceFee.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between border-t border-[#292929] pt-2 text-sm font-bold text-white">
                  <span>Total Payable</span>
                  <span className="text-[#ED1C24]">₹{totalPayable.toLocaleString("en-IN")}</span>
                </div>
              </div>

              {/* Proceed to Seat Selection CTA */}
              <button
                onClick={handleProceedToSeats}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#ED1C24] py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-[#ED1C24]/30 transition hover:bg-[#FF3038]"
              >
                <span>Select Seats</span>
                <ChevronRight size={16} />
              </button>

              <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-[#777777]">
                <ShieldCheck size={13} className="text-[#16A34A]" />
                <span>Instant seat reservation & safe SSL checkout</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
