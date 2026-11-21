import { useSearchParams, useParams, Link } from "react-router-dom";
import {
  CheckCircle2,
  Calendar,
  MapPin,
  Download,
  Share2,
  Ticket,
  Sparkles,
} from "lucide-react";
import { useState, useEffect } from "react";
import { apiGet } from "../../services/api";
import type { EventItem } from "../../types/content";

export default function BookingConfirmation() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const [searchParams] = useSearchParams();

  const seatsParam = searchParams.get("seats") || "E12, E13";
  const eventId = searchParams.get("eventId") || "";
  const amount = searchParams.get("amount") || "3,716";

  const [event, setEvent] = useState<EventItem | null>(null);

  useEffect(() => {
    let mounted = true;
    if (eventId) {
      void apiGet(`/events/${eventId}`).then((res) => {
        if (mounted && res) setEvent(res as EventItem);
      }).catch(() => undefined);
    }
    return () => {
      mounted = false;
    };
  }, [eventId]);

  const eventTitle = event?.title || "Anirudh Live in Chennai!";
  const venueLocation = event?.location || event?.venue || "YMCA Grounds, Chennai";

  return (
    <div className="min-h-screen bg-[#000000] text-white">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-8">
        {/* ================= 1. SUCCESS INDICATOR HEADER ================= */}
        <div className="text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-[#16A34A]/20 text-[#16A34A] border border-[#16A34A]/40 mb-4 animate-bounce">
            <CheckCircle2 size={36} />
          </div>

          <h1 className="font-display text-3xl sm:text-4xl font-black uppercase tracking-tight text-white">
            Booking Confirmed!
          </h1>
          <p className="mt-2 text-sm text-[#BDBDBD]">
            Your tickets have been booked successfully and sent to your registered email.
          </p>

          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#292929] bg-[#111111] px-4 py-1.5 text-xs text-[#BDBDBD]">
            <span>Booking ID:</span>
            <span className="font-bold text-white tracking-wider">{bookingId || "EVT-784532"}</span>
          </div>
        </div>

        {/* ================= 2. DIGITAL TICKET CARD (Matching Screenshot) ================= */}
        <div className="mt-10 overflow-hidden rounded-3xl border border-[#292929] bg-[#111111] shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-12">
            {/* Left Image & Event Meta (8 cols) */}
            <div className="md:col-span-8 p-6 sm:p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#292929]">
              <div className="flex gap-5">
                <img
                  src={event?.imageUrl || "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=400&q=80"}
                  alt={eventTitle}
                  className="size-24 rounded-2xl object-cover border border-[#292929]"
                />
                <div>
                  <span className="rounded bg-[#ED1C24] px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                    {event?.category || "Music Concert"}
                  </span>
                  <h2 className="mt-1 text-xl font-black text-white">{eventTitle}</h2>
                  <div className="mt-3 space-y-1 text-xs text-[#BDBDBD]">
                    <p className="flex items-center gap-1.5">
                      <Calendar size={13} className="text-[#ED1C24]" />
                      Sun, Jan 28, 2027 • 7:00 PM
                    </p>
                    <p className="flex items-center gap-1.5">
                      <MapPin size={13} className="text-[#ED1C24]" />
                      {venueLocation}
                    </p>
                  </div>
                </div>
              </div>

              {/* Ticket Details Pill Row */}
              <div className="mt-8 grid grid-cols-3 gap-4 border-t border-[#292929] pt-4 text-xs">
                <div>
                  <span className="text-[#777777]">Category</span>
                  <p className="font-bold text-white mt-0.5">Premium</p>
                </div>
                <div>
                  <span className="text-[#777777]">Seats</span>
                  <p className="font-bold text-[#ED1C24] mt-0.5">{seatsParam}</p>
                </div>
                <div>
                  <span className="text-[#777777]">Total Paid</span>
                  <p className="font-bold text-white mt-0.5">₹{amount}</p>
                </div>
              </div>
            </div>

            {/* Right QR Code Section (4 cols) */}
            <div className="md:col-span-4 p-6 sm:p-8 flex flex-col items-center justify-center bg-[#0D0D0D] text-center">
              {/* High fidelity realistic QR display */}
              <div className="rounded-2xl border-2 border-white/10 bg-white p-3 shadow-lg">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=EVENTX-${bookingId || "EVT-784532"}-VERIFIED`}
                  alt="Entry QR"
                  className="size-32"
                />
              </div>
              <span className="mt-3 text-[11px] font-bold uppercase tracking-wider text-[#BDBDBD]">
                Scan at Entry
              </span>
              <p className="mt-1 text-[10px] text-[#777777]">Keep QR code ready at the gate</p>
            </div>
          </div>
        </div>

        {/* ================= 3. TICKET ACTION BUTTONS ================= */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 rounded-xl border border-[#292929] bg-[#111111] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition hover:border-[#ED1C24]"
          >
            <Download size={14} className="text-[#ED1C24]" />
            Download Ticket
          </button>
          <button
            onClick={() => alert("Added to device calendar!")}
            className="flex items-center gap-2 rounded-xl border border-[#292929] bg-[#111111] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition hover:border-[#ED1C24]"
          >
            <Calendar size={14} className="text-[#ED1C24]" />
            Add to Calendar
          </button>
          <button
            onClick={() => {
              if (navigator.share) {
                void navigator.share({ title: eventTitle, text: `I am going to ${eventTitle}!`, url: window.location.href });
              } else {
                alert("Link copied to clipboard!");
              }
            }}
            className="flex items-center gap-2 rounded-xl border border-[#292929] bg-[#111111] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition hover:border-[#ED1C24]"
          >
            <Share2 size={14} className="text-[#ED1C24]" />
            Share
          </button>
          <Link
            to="/my-bookings"
            className="flex items-center gap-2 rounded-xl bg-[#ED1C24] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-[#ED1C24]/20 transition hover:bg-[#FF3038]"
          >
            <Ticket size={14} />
            View in My Bookings
          </Link>
        </div>

        {/* ================= 4. EVENTX PASS BANNER PROMOTION ================= */}
        <div className="mt-12 rounded-3xl border border-[#ED1C24]/30 bg-gradient-to-r from-[#171717] via-[#111111] to-[#0A0A0A] p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-[#ED1C24] text-white">
              <Sparkles size={24} />
            </div>
            <div>
              <h3 className="font-display text-lg font-black uppercase text-white">Get more with EventX Pass</h3>
              <p className="text-xs text-[#BDBDBD]">Unlock exclusive discounts, priority booking and zero fees on future experiences.</p>
            </div>
          </div>
          <Link
            to="/rewards"
            className="whitespace-nowrap rounded-xl bg-[#ED1C24] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#FF3038] transition"
          >
            Explore EventX Pass
          </Link>
        </div>
      </div>
    </div>
  );
}
