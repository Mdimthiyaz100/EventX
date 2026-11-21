import { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import { apiGet } from "../../services/api";
import type { EventItem } from "../../types/content";

interface Seat {
  id: string;
  row: string;
  number: number;
  status: "AVAILABLE" | "SELECTED" | "BOOKED";
  price: number;
  tier: string;
}

export default function SeatSelection() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const requestedQty = Math.max(1, parseInt(searchParams.get("qty") || "2", 10));

  const [event, setEvent] = useState<EventItem | null>(null);
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);

  // Rows A through J (10 rows, 16 seats each)
  const rows = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
  const seatsPerRow = 16;

  // Generate grid with pre-booked seats for realistic commercial feel
  const [seats, setSeats] = useState<Seat[]>([]);

  useEffect(() => {
    let mounted = true;
    async function loadEvent() {
      if (!id) return;
      try {
        const data = await apiGet(`/events/${id}`);
        if (mounted && data) {
          const evt = data as EventItem;
          setEvent(evt);

          const tierPrice = evt.price ? Number(evt.price) : 1999;

          // Generate seat layout
          const generated: Seat[] = [];
          rows.forEach((rowLetter, rIdx) => {
            for (let num = 1; num <= seatsPerRow; num++) {
              // Deterministically mark some seats as booked
              const isBooked = (rIdx === 2 && (num === 4 || num === 5)) ||
                (rIdx === 4 && (num >= 8 && num <= 10)) ||
                (rIdx === 6 && (num === 12 || num === 13)) ||
                (rIdx === 7 && num === 3);

              generated.push({
                id: `${rowLetter}${num}`,
                row: rowLetter,
                number: num,
                status: isBooked ? "BOOKED" : "AVAILABLE",
                price: tierPrice,
                tier: rIdx < 3 ? "VIP" : rIdx < 7 ? "Premium" : "General",
              });
            }
          });

          // Preselect requested count if available in row E
          const preselect = ["E12", "E13"].slice(0, requestedQty);
          setSeats(generated);
          setSelectedSeatIds(preselect);
        }
      } catch (err) {
        console.error("Failed to load event seating", err);
      }
    }
    loadEvent();
    return () => {
      mounted = false;
    };
  }, [id, requestedQty]);

  const toggleSeat = (seat: Seat) => {
    if (seat.status === "BOOKED") return;

    if (selectedSeatIds.includes(seat.id)) {
      setSelectedSeatIds((prev) => prev.filter((s) => s !== seat.id));
    } else {
      if (selectedSeatIds.length >= 8) {
        alert("Maximum 8 seats allowed per booking.");
        return;
      }
      setSelectedSeatIds((prev) => [...prev, seat.id]);
    }
  };

  const selectedSeatsList = seats.filter((s) => selectedSeatIds.includes(s.id));
  const basePrice = selectedSeatsList.length > 0 ? selectedSeatsList[0].price : 1999;
  const subtotal = basePrice * selectedSeatsList.length;
  const convenienceFee = selectedSeatsList.length > 0 ? 118 : 0;
  const totalAmount = subtotal + convenienceFee;

  const handleProceedToCheckout = () => {
    if (selectedSeatIds.length === 0) {
      alert("Please select at least 1 seat.");
      return;
    }
    const seatsStr = encodeURIComponent(selectedSeatIds.join(","));
    navigate(`/checkout?eventId=${event?.id}&seats=${seatsStr}&amount=${totalAmount}`);
  };

  return (
    <div className="min-h-screen bg-[#000000] text-white">
      {/* Top Bar Navigation */}
      <div className="border-b border-[#292929] bg-[#0A0A0A]">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-4 py-3 sm:px-8 lg:px-12">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-xs font-semibold text-[#BDBDBD] hover:text-white transition"
          >
            <ArrowLeft size={15} />
            <span>Back to Event</span>
          </button>
          <div className="text-center">
            <h1 className="text-sm font-bold text-white uppercase tracking-wider">{event?.title || "Select Your Seats"}</h1>
            <p className="text-[11px] text-[#777777]">{event?.location || "Main Stadium Auditorium"}</p>
          </div>
          <div className="w-20" />
        </div>
      </div>

      <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          {/* ================= SEAT MAP CANVAS (8 cols) ================= */}
          <div className="lg:col-span-8 flex flex-col items-center">
            {/* Curved STAGE matching the user's reference mockup */}
            <div className="relative mb-12 flex w-full max-w-xl flex-col items-center">
              <div className="h-14 w-full rounded-b-[100px] border-b-2 border-x-2 border-[#ED1C24] bg-gradient-to-b from-[#ED1C24]/10 to-transparent flex items-center justify-center shadow-lg shadow-[#ED1C24]/20">
                <span className="font-display text-base font-black tracking-widest text-[#ED1C24] uppercase">
                  STAGE
                </span>
              </div>
              <p className="mt-2 text-[10px] uppercase tracking-widest text-[#777777]">All eyes this way</p>
            </div>

            {/* Legend matching exact requested color tokens */}
            <div className="mb-8 flex items-center gap-8 rounded-2xl border border-[#292929] bg-[#111111] px-6 py-2.5 text-xs font-semibold text-[#BDBDBD]">
              <div className="flex items-center gap-2">
                <div className="size-4 rounded-md border border-[#777777] bg-[#BDBDBD]" />
                <span>Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="size-4 rounded-md bg-[#ED1C24]" />
                <span className="text-white font-bold">Selected</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="size-4 rounded-md border border-[#292929] bg-[#262626]" />
                <span className="text-[#777777]">Booked</span>
              </div>
            </div>

            {/* Interactive Grid with aisle in the middle */}
            <div className="no-scrollbar overflow-x-auto w-full flex justify-center py-4">
              <div className="flex flex-col gap-2.5 min-w-[560px]">
                {rows.map((rowLetter) => {
                  const rowSeats = seats.filter((s) => s.row === rowLetter);
                  return (
                    <div key={rowLetter} className="flex items-center justify-center gap-2">
                      <span className="w-5 text-center text-xs font-bold text-[#777777]">{rowLetter}</span>

                      {/* Left Block (Seats 1 to 8) */}
                      <div className="flex gap-1.5">
                        {rowSeats.slice(0, 8).map((seat) => {
                          const isSelected = selectedSeatIds.includes(seat.id);
                          const isBooked = seat.status === "BOOKED";
                          return (
                            <button
                              key={seat.id}
                              disabled={isBooked}
                              onClick={() => toggleSeat(seat)}
                              title={`${seat.id} - ₹${seat.price}`}
                              className={`size-6 rounded-md text-[10px] font-bold transition flex items-center justify-center ${
                                isBooked
                                  ? "bg-[#262626] text-[#555555] cursor-not-allowed"
                                  : isSelected
                                  ? "bg-[#ED1C24] text-white scale-110 shadow-md shadow-[#ED1C24]/50"
                                  : "bg-[#BDBDBD] text-black hover:bg-white hover:scale-105"
                              }`}
                            >
                              {seat.number}
                            </button>
                          );
                        })}
                      </div>

                      {/* Central Aisle */}
                      <div className="w-6" />

                      {/* Right Block (Seats 9 to 16) */}
                      <div className="flex gap-1.5">
                        {rowSeats.slice(8, 16).map((seat) => {
                          const isSelected = selectedSeatIds.includes(seat.id);
                          const isBooked = seat.status === "BOOKED";
                          return (
                            <button
                              key={seat.id}
                              disabled={isBooked}
                              onClick={() => toggleSeat(seat)}
                              title={`${seat.id} - ₹${seat.price}`}
                              className={`size-6 rounded-md text-[10px] font-bold transition flex items-center justify-center ${
                                isBooked
                                  ? "bg-[#262626] text-[#555555] cursor-not-allowed"
                                  : isSelected
                                  ? "bg-[#ED1C24] text-white scale-110 shadow-md shadow-[#ED1C24]/50"
                                  : "bg-[#BDBDBD] text-black hover:bg-white hover:scale-105"
                              }`}
                            >
                              {seat.number}
                            </button>
                          );
                        })}
                      </div>

                      <span className="w-5 text-center text-xs font-bold text-[#777777]">{rowLetter}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ================= RIGHT SIDEBAR: SEAT SUMMARY (4 cols) ================= */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 rounded-3xl border border-[#292929] bg-[#111111] p-6 shadow-2xl">
              <h2 className="font-display text-lg font-black uppercase tracking-wider text-white">
                Ticket Summary
              </h2>

              {/* Selected Seats Chips */}
              <div className="mt-4">
                <span className="text-xs text-[#777777]">Selected Seats ({selectedSeatIds.length})</span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedSeatIds.length > 0 ? (
                    selectedSeatIds.map((seatId) => (
                      <span
                        key={seatId}
                        className="inline-flex items-center gap-1 rounded-lg border border-[#ED1C24] bg-[#ED1C24]/10 px-3 py-1 text-xs font-bold text-white"
                      >
                        {seatId}
                      </span>
                    ))
                  ) : (
                    <p className="text-xs text-[#777777] italic">No seats selected yet. Click any seat on the map.</p>
                  )}
                </div>
              </div>

              {/* Price Calculation Box */}
              <div className="mt-6 space-y-2.5 border-t border-[#292929] pt-4 text-xs text-[#BDBDBD]">
                <div className="flex justify-between">
                  <span>Premium Ticket (₹{basePrice.toLocaleString("en-IN")} × {selectedSeatIds.length})</span>
                  <span className="text-white font-medium">₹{subtotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span>Convenience Fee</span>
                  <span className="text-white font-medium">₹{convenienceFee}</span>
                </div>
                <div className="flex justify-between border-t border-[#292929] pt-3 text-base font-bold text-white">
                  <span>Total Amount</span>
                  <span className="text-[#ED1C24]">₹{totalAmount.toLocaleString("en-IN")}</span>
                </div>
              </div>

              {/* Proceed CTA Button */}
              <button
                onClick={handleProceedToCheckout}
                disabled={selectedSeatIds.length === 0}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#ED1C24] py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-[#ED1C24]/30 transition hover:bg-[#FF3038] disabled:opacity-40 disabled:pointer-events-none"
              >
                <span>Proceed to Checkout</span>
                <ChevronRight size={16} />
              </button>

              <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-[#777777]">
                <ShieldCheck size={13} className="text-[#16A34A]" />
                <span>Seats temporarily locked for 10 minutes</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
