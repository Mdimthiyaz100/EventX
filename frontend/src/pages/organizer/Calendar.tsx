import { useState } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
} from "lucide-react";

interface SlotItem {
  id: string;
  time: string;
  facility: string;
  status: "CONFIRMED" | "AVAILABLE" | "BLOCKED";
  customer?: string;
  price: number;
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"MONTH" | "WEEK" | "DAY">("MONTH");
  const [selectedSlot, setSelectedSlot] = useState<SlotItem | null>(null);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Sample slots for interactive slot calendar
  const sampleSlots: SlotItem[] = [
    {
      id: "s1",
      time: "06:00 AM - 07:00 AM",
      facility: "Smash Arena - Turf A",
      status: "CONFIRMED",
      customer: "Karthik Raja (₹1,500)",
      price: 1500,
    },
    {
      id: "s2",
      time: "07:00 AM - 08:00 AM",
      facility: "Smash Arena - Turf A",
      status: "AVAILABLE",
      price: 1500,
    },
    {
      id: "s3",
      time: "08:00 AM - 09:00 AM",
      facility: "Smash Arena - Turf B",
      status: "CONFIRMED",
      customer: "Vimal Kumar (₹1,800)",
      price: 1800,
    },
    {
      id: "s4",
      time: "05:00 PM - 06:00 PM",
      facility: "Smash Arena - Turf A",
      status: "BLOCKED",
      customer: "Maintenance & Watering",
      price: 0,
    },
    {
      id: "s5",
      time: "07:00 PM - 08:00 PM",
      facility: "Smash Arena - Turf A",
      status: "CONFIRMED",
      customer: "Super Strikers Team (₹2,200)",
      price: 2200,
    },
  ];

  const handlePrev = () => {
    const next = new Date(currentDate);
    next.setMonth(next.getMonth() - 1);
    setCurrentDate(next);
  };

  const handleNext = () => {
    const next = new Date(currentDate);
    next.setMonth(next.getMonth() + 1);
    setCurrentDate(next);
  };

  return (
    <div className="space-y-6 text-white">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
            Booking & Facility Calendar
          </h1>
          <p className="mt-1 text-xs text-[#A1A1AA]">
            Real-time schedule of reserved time slots, public event dates, and turf maintenance.
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-1 rounded-xl border border-[#292929] bg-[#141414] p-1">
          {(["MONTH", "WEEK", "DAY"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setViewMode(m)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                viewMode === m
                  ? "bg-[#F51D2B] text-white shadow-md shadow-[#F51D2B]/20"
                  : "text-[#A1A1AA] hover:text-white"
              }`}
            >
              {m.charAt(0) + m.slice(1).toLowerCase()} View
            </button>
          ))}
        </div>
      </div>

      {/* Calendar Controls */}
      <div className="flex items-center justify-between rounded-2xl border border-[#292929] bg-[#141414] px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="grid size-9 place-items-center rounded-xl bg-[#F51D2B]/10 text-[#F51D2B]">
            <CalendarIcon size={16} />
          </div>
          <span className="font-display text-lg font-black text-white">
            {months[currentDate.getMonth()]} {currentDate.getFullYear()}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentDate(new Date())}
            className="rounded-xl border border-[#292929] bg-[#1A1A1A] px-3 py-1.5 text-xs font-medium text-white hover:border-[#3a3a3a]"
          >
            Today
          </button>
          <div className="flex items-center rounded-xl border border-[#292929] bg-[#1A1A1A]">
            <button
              onClick={handlePrev}
              className="grid size-8 place-items-center text-[#A1A1AA] hover:text-white"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={handleNext}
              className="grid size-8 place-items-center text-[#A1A1AA] hover:text-white border-l border-[#292929]"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid (Month View) */}
      <div className="rounded-2xl border border-[#292929] bg-[#141414] overflow-hidden">
        {/* Days of week header */}
        <div className="grid grid-cols-7 border-b border-[#292929] bg-[#1A1A1A]/80 text-center text-xs font-bold text-[#777777] py-2.5">
          {daysOfWeek.map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>

        {/* 35 Calendar Cells */}
        <div className="grid grid-cols-7 divide-x divide-y divide-[#222222]">
          {Array.from({ length: 35 }).map((_, index) => {
            const dayNumber = (index % 31) + 1;
            const isToday = dayNumber === 21;
            const hasBooking = dayNumber === 21 || dayNumber === 22 || dayNumber === 24;

            return (
              <div
                key={index}
                className={`min-h-[105px] p-2.5 transition hover:bg-[#1A1A1A]/40 flex flex-col justify-between ${
                  isToday ? "bg-[#1A1A1A]/60" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`grid size-6 place-items-center rounded-full text-xs font-bold ${
                      isToday
                        ? "bg-[#F51D2B] text-white shadow-md shadow-[#F51D2B]/30"
                        : "text-[#A1A1AA]"
                    }`}
                  >
                    {dayNumber}
                  </span>
                  {hasBooking && (
                    <span className="size-1.5 rounded-full bg-emerald-400" />
                  )}
                </div>

                {hasBooking && (
                  <div className="mt-2 space-y-1">
                    <button
                      onClick={() => setSelectedSlot(sampleSlots[0])}
                      className="w-full truncate rounded-md bg-emerald-500/15 px-1.5 py-1 text-left text-[10px] font-bold text-emerald-400 hover:bg-emerald-500/25"
                    >
                      3 Confirmed Slots
                    </button>
                    {dayNumber === 21 && (
                      <button
                        onClick={() => setSelectedSlot(sampleSlots[3])}
                        className="w-full truncate rounded-md bg-amber-500/15 px-1.5 py-0.5 text-left text-[9px] font-medium text-amber-400"
                      >
                        1 Blocked
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Day Slots Breakdown */}
      <div className="rounded-2xl border border-[#292929] bg-[#141414] p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-sm font-bold text-white">
              Slot Breakdown for Selected Date ({months[currentDate.getMonth()]} 21, 2026)
            </h3>
            <p className="text-[11px] text-[#A1A1AA]">
              View hourly slot reservations, pricing, and blocked maintenance times.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {sampleSlots.map((slot) => {
            const isConfirmed = slot.status === "CONFIRMED";
            const isAvail = slot.status === "AVAILABLE";
            return (
              <div
                key={slot.id}
                onClick={() => setSelectedSlot(slot)}
                className="cursor-pointer rounded-xl border border-[#292929] bg-[#1A1A1A] p-4 transition hover:border-[#3a3a3a]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
                    <Clock size={13} className="text-[#F51D2B]" />
                    <span>{slot.time}</span>
                  </div>
                  <span
                    className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                      isConfirmed
                        ? "bg-emerald-500/10 text-emerald-400"
                        : isAvail
                        ? "bg-sky-500/10 text-sky-400"
                        : "bg-amber-500/10 text-amber-400"
                    }`}
                  >
                    {slot.status}
                  </span>
                </div>

                <div className="mt-3 text-xs">
                  <p className="font-medium text-white">{slot.facility}</p>
                  <p className="text-[11px] text-[#777777] mt-0.5">
                    {slot.customer || "Available for instant booking"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Slot Details Modal */}
      {selectedSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-[#292929] bg-[#141414] p-6 text-xs">
            <h3 className="text-base font-bold text-white">Slot Information</h3>
            <div className="mt-4 space-y-3">
              <div>
                <p className="text-[#777777]">Facility</p>
                <p className="font-semibold text-white">{selectedSlot.facility}</p>
              </div>
              <div>
                <p className="text-[#777777]">Time Slot</p>
                <p className="font-semibold text-white">{selectedSlot.time}</p>
              </div>
              <div>
                <p className="text-[#777777]">Status</p>
                <p className="font-bold text-emerald-400">{selectedSlot.status}</p>
              </div>
              <div>
                <p className="text-[#777777]">Details / Booker</p>
                <p className="text-white">{selectedSlot.customer || "None"}</p>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedSlot(null)}
                className="rounded-xl bg-[#F51D2B] px-5 py-2 font-bold text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
