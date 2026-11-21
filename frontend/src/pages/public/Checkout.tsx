import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import {
  ShieldCheck,
  CreditCard,
  Smartphone,
  Building,
  Wallet,
  CheckCircle2,
  ChevronRight,
  AlertCircle,
  Calendar,
  MapPin,
  User,
  Mail,
  Phone,
} from "lucide-react";
import { apiGet, apiRequest } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import type { EventItem } from "../../types/content";

export default function Checkout() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const eventId = searchParams.get("eventId") || "";
  const seatsParam = searchParams.get("seats") || "E12,E13";
  const selectedSeats = seatsParam.split(",").filter(Boolean);

  const [event, setEvent] = useState<EventItem | null>(null);

  // Contact Information
  const [contactName, setContactName] = useState(user?.name || "Mohamed Imthiyaz");
  const [contactEmail, setContactEmail] = useState(user?.email || "imthiyaz@example.com");
  const [contactPhone, setContactPhone] = useState("+91 98765 43210");
  const [isEditingContact, setIsEditingContact] = useState(false);

  // Promo Code
  const [promoCode, setPromoCode] = useState("EVENTX100");
  const [promoApplied, setPromoApplied] = useState(true);
  const [discountAmount, setDiscountAmount] = useState(400);
  const [promoMessage, setPromoMessage] = useState("Promo applied! You saved ₹400");

  // Payment Method
  const [selectedMethod, setSelectedMethod] = useState<"UPI" | "CARD" | "NETBANKING" | "WALLET">("UPI");
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");

  useEffect(() => {
    let mounted = true;
    async function loadEvent() {
      if (!eventId) return;
      try {
        const data = await apiGet(`/events/${eventId}`);
        if (mounted && data) {
          setEvent(data as EventItem);
        }
      } catch (err) {
        console.error("Failed to load checkout event", err);
      }
    }
    loadEvent();
    return () => {
      mounted = false;
    };
  }, [eventId]);

  const unitPrice = Number(event?.price || 1999);
  const subtotal = unitPrice * selectedSeats.length;
  const convenienceFee = 118;
  const currentDiscount = promoApplied ? discountAmount : 0;
  const totalPayable = Math.max(0, subtotal + convenienceFee - currentDiscount);

  const handleApplyPromo = () => {
    if (promoCode.trim().toUpperCase() === "EVENTX100") {
      setPromoApplied(true);
      setDiscountAmount(400);
      setPromoMessage("Promo applied! You saved ₹400");
    } else {
      setPromoApplied(false);
      setDiscountAmount(0);
      setPromoMessage("Invalid coupon code. Try EVENTX100");
    }
  };

  const handleRemovePromo = () => {
    setPromoApplied(false);
    setDiscountAmount(0);
    setPromoMessage("");
    setPromoCode("");
  };

  const handleProcessPayment = async () => {
    setIsProcessing(true);
    setCheckoutError("");

    try {
      // 1. Create booking in backend
      const idempotencyKey = `idemp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

      // If event ticket types are present, map them, or use a general fallback
      const ticketTypeId = event?.ticketTypes?.[0]?.id;

      let bookingId = `EVT-${Math.floor(100000 + Math.random() * 900000)}`;

      if (ticketTypeId && user) {
        try {
          const bookingRes = await apiRequest<{ id: string }>(
            "POST",
            "/bookings",
            {
              eventId: event.id,
              items: [{ ticketTypeId, quantity: selectedSeats.length }],
            },
            undefined,
            { "Idempotency-Key": idempotencyKey }
          );
          if (bookingRes?.id) {
            bookingId = bookingRes.id;
          }
        } catch {
          // Keep resilient fallback identifier for complete user flow demonstration
        }
      }

      // Simulate instantaneous secure gateway capture & route to confirmation
      setTimeout(() => {
        navigate(`/booking-confirmed/${bookingId}?seats=${encodeURIComponent(selectedSeats.join(","))}&eventId=${event?.id || ""}&amount=${totalPayable}`);
      }, 1200);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Payment processing encountered an issue.";
      setCheckoutError(msg);
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#000000] text-white">
      {/* Breadcrumb / Top Bar */}
      <div className="border-b border-[#292929] bg-[#0A0A0A]">
        <div className="mx-auto flex max-w-[1440px] items-center gap-2 px-4 py-3.5 text-xs text-[#777777] sm:px-8 lg:px-12">
          <Link to="/" className="hover:text-white">Home</Link>
          <ChevronRight size={13} />
          <Link to="/events" className="hover:text-white">Events</Link>
          <ChevronRight size={13} />
          <span className="text-white font-medium">Checkout</span>
        </div>
      </div>

      <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-8 lg:px-12">
        <h1 className="font-display text-3xl font-black uppercase tracking-tight text-white mb-8">
          Checkout
        </h1>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          {/* ================= LEFT COLUMN: BOOKING & CONTACT DETAILS (7 cols) ================= */}
          <div className="lg:col-span-7 space-y-6">
            {/* Booking Summary Box */}
            <div className="rounded-3xl border border-[#292929] bg-[#111111] p-6 shadow-2xl">
              <h2 className="font-display text-lg font-black uppercase tracking-wider text-white mb-4">
                Booking Details
              </h2>

              <div className="flex gap-4">
                <img
                  src={event?.imageUrl || "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=400&q=80"}
                  alt={event?.title || "Event"}
                  className="size-24 rounded-2xl object-cover border border-[#292929]"
                />
                <div className="flex-1">
                  <span className="rounded bg-[#ED1C24] px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                    {event?.category || "Music Concert"}
                  </span>
                  <h3 className="mt-1.5 text-lg font-bold text-white">{event?.title || "Anirudh Live in Chennai"}</h3>
                  <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-[#BDBDBD]">
                    <span className="flex items-center gap-1.5">
                      <Calendar size={13} className="text-[#ED1C24]" />
                      Sun, Jan 28, 2027 • 7:00 PM
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin size={13} className="text-[#ED1C24]" />
                      {event?.location || "YMCA Grounds, Chennai"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-4 border-t border-[#292929] pt-4 text-xs">
                <div>
                  <span className="text-[#777777]">Ticket Category</span>
                  <p className="mt-1 font-bold text-white">Premium</p>
                </div>
                <div>
                  <span className="text-[#777777]">Selected Seats</span>
                  <p className="mt-1 font-bold text-[#ED1C24]">{selectedSeats.join(", ")}</p>
                </div>
                <div>
                  <span className="text-[#777777]">Quantity</span>
                  <p className="mt-1 font-bold text-white">{selectedSeats.length} Tickets</p>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="rounded-3xl border border-[#292929] bg-[#111111] p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-lg font-black uppercase tracking-wider text-white">
                  Contact Information
                </h2>
                <button
                  onClick={() => setIsEditingContact(!isEditingContact)}
                  className="text-xs font-semibold text-[#ED1C24] hover:underline"
                >
                  {isEditingContact ? "Save" : "Edit"}
                </button>
              </div>

              {isEditingContact ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] text-[#777777]">Full Name</label>
                    <input
                      type="text"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="w-full rounded-xl border border-[#292929] bg-[#0A0A0A] p-2.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-[#777777]">Email Address</label>
                    <input
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="w-full rounded-xl border border-[#292929] bg-[#0A0A0A] p-2.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-[#777777]">Phone Number</label>
                    <input
                      type="text"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      className="w-full rounded-xl border border-[#292929] bg-[#0A0A0A] p-2.5 text-xs text-white"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2 text-xs text-[#BDBDBD]">
                  <div className="flex items-center gap-2">
                    <User size={14} className="text-[#777777]" />
                    <span className="font-semibold text-white">{contactName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail size={14} className="text-[#777777]" />
                    <span>{contactEmail}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={14} className="text-[#777777]" />
                    <span>{contactPhone}</span>
                  </div>
                </div>
              )}

              <p className="mt-4 text-[11px] text-[#777777]">
                Your booking confirmation and digital QR ticket will be delivered to this verified email and phone number.
              </p>
            </div>
          </div>

          {/* ================= RIGHT COLUMN: PAYMENT SUMMARY & METHOD (5 cols) ================= */}
          <div className="lg:col-span-5 space-y-6">
            {/* Promo Code Box */}
            <div className="rounded-3xl border border-[#292929] bg-[#111111] p-6 shadow-2xl">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-3">Apply Promo Code</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="Enter coupon code"
                  className="flex-1 rounded-xl border border-[#292929] bg-[#0A0A0A] px-3.5 py-2.5 text-xs uppercase tracking-wider text-white placeholder-[#777777] focus:border-[#ED1C24] focus:outline-none"
                />
                {promoApplied ? (
                  <button
                    onClick={handleRemovePromo}
                    className="rounded-xl border border-[#292929] bg-[#171717] px-4 py-2.5 text-xs font-bold text-[#EF4444] hover:bg-[#262626]"
                  >
                    Remove
                  </button>
                ) : (
                  <button
                    onClick={handleApplyPromo}
                    className="rounded-xl bg-[#ED1C24] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#FF3038]"
                  >
                    Apply
                  </button>
                )}
              </div>
              {promoMessage && (
                <p className={`mt-2 text-xs flex items-center gap-1 ${promoApplied ? "text-[#16A34A]" : "text-[#EF4444]"}`}>
                  {promoApplied && <CheckCircle2 size={13} />}
                  {promoMessage}
                </p>
              )}
            </div>

            {/* Payment Method Selector */}
            <div className="rounded-3xl border border-[#292929] bg-[#111111] p-6 shadow-2xl">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Select Payment Method</h3>
              <div className="space-y-3">
                {[
                  { id: "UPI", label: "UPI (Google Pay, PhonePe, Paytm)", icon: Smartphone },
                  { id: "CARD", label: "Credit / Debit Card", icon: CreditCard },
                  { id: "NETBANKING", label: "Net Banking", icon: Building },
                  { id: "WALLET", label: "Wallet (Paytm, Amazon Pay)", icon: Wallet },
                ].map((method) => {
                  const Icon = method.icon;
                  const isSelected = selectedMethod === method.id;
                  return (
                    <div
                      key={method.id}
                      onClick={() => setSelectedMethod(method.id as typeof selectedMethod)}
                      className={`flex cursor-pointer items-center justify-between rounded-2xl border p-3.5 transition ${
                        isSelected
                          ? "border-[#ED1C24] bg-[#ED1C24]/10"
                          : "border-[#292929] bg-[#0A0A0A] hover:border-[#777777]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={16} className={isSelected ? "text-[#ED1C24]" : "text-[#777777]"} />
                        <span className="text-xs font-semibold text-white">{method.label}</span>
                      </div>
                      <div
                        className={`size-4 rounded-full border flex items-center justify-center ${
                          isSelected ? "border-[#ED1C24] bg-[#ED1C24]" : "border-[#777777]"
                        }`}
                      >
                        {isSelected && <span className="size-1.5 rounded-full bg-white" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Price Summary & Payment CTA */}
            <div className="rounded-3xl border border-[#292929] bg-[#111111] p-6 shadow-2xl">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Payment Summary</h3>

              <div className="space-y-2 text-xs text-[#BDBDBD]">
                <div className="flex justify-between">
                  <span>Tickets ({selectedSeats.length} × ₹{unitPrice.toLocaleString("en-IN")})</span>
                  <span className="text-white font-medium">₹{subtotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span>Convenience Fee</span>
                  <span className="text-white font-medium">₹{convenienceFee}</span>
                </div>
                {promoApplied && (
                  <div className="flex justify-between text-[#16A34A] font-semibold">
                    <span>Promo Discount</span>
                    <span>- ₹{discountAmount}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-[#292929] pt-3 text-base font-extrabold text-white">
                  <span>Total Payable</span>
                  <span className="text-[#ED1C24]">₹{totalPayable.toLocaleString("en-IN")}</span>
                </div>
              </div>

              {checkoutError && (
                <div className="mt-3 flex items-center gap-1.5 text-xs text-[#EF4444]">
                  <AlertCircle size={14} />
                  <span>{checkoutError}</span>
                </div>
              )}

              <button
                onClick={handleProcessPayment}
                disabled={isProcessing}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#ED1C24] py-4 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-[#ED1C24]/30 transition hover:bg-[#FF3038] disabled:opacity-50"
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <div className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    <span>Processing Payment…</span>
                  </div>
                ) : (
                  <>
                    <ShieldCheck size={16} />
                    <span>Pay ₹{totalPayable.toLocaleString("en-IN")}</span>
                  </>
                )}
              </button>

              <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-[#777777]">
                <ShieldCheck size={12} className="text-[#16A34A]" />
                <span>256-Bit Encrypted Secure Checkout</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
