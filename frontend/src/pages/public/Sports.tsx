import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  MapPin,
  ShieldCheck,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

interface Facility {
  id: string;
  name: string;
  sport: string;
  location: string;
  address: string;
  hourlyRate: number;
  advanceType: "FIXED" | "PERCENTAGE";
  advanceValue: number; // e.g. 500 fixed or 30%
  imageUrl: string;
  availableDates: string[];
  slots: string[];
  amenities: string[];
}

export default function Sports() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [selectedSport, setSelectedSport] = useState("All Sports");
  const [selectedFacilityId, setSelectedFacilityId] = useState("fac-1");
  const [selectedDate, setSelectedDate] = useState("Today, 21 Nov");
  const [selectedDuration, setSelectedDuration] = useState(1); // 1 or 2 hours
  const [selectedSlot, setSelectedSlot] = useState("6:00 PM - 7:00 PM");

  // Customer Information
  const [customerName, setCustomerName] = useState(user?.name || "Mohamed Imthiyaz");
  const [customerPhone, setCustomerPhone] = useState("+91 98765 43210");
  const [customerEmail, setCustomerEmail] = useState(user?.email || "imthiyaz@example.com");

  // Booking result modal
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [confirmedBookingId, setConfirmedBookingId] = useState("");

  const facilities: Facility[] = [
    {
      id: "fac-1",
      name: "Smash Sports Arena - Velachery",
      sport: "Football & Cricket Box",
      location: "Velachery, Chennai (2.8 km)",
      address: "14/2 Gandhi Road, Velachery Main Road, Chennai - 600042",
      hourlyRate: 1400,
      advanceType: "PERCENTAGE",
      advanceValue: 30, // 30% advance
      imageUrl: "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&w=1000&q=80",
      availableDates: ["Today, 21 Nov", "Tomorrow, 22 Nov", "Sat, 23 Nov", "Sun, 24 Nov"],
      slots: ["5:00 AM - 6:00 AM", "6:00 AM - 7:00 AM", "5:00 PM - 6:00 PM", "6:00 PM - 7:00 PM", "7:00 PM - 8:00 PM", "8:00 PM - 9:00 PM", "9:00 PM - 10:00 PM"],
      amenities: ["Floodlights", "Changing Rooms", "Bibs & Footballs", "Drinking Water", "Parking"],
    },
    {
      id: "fac-2",
      name: "Dugout Box Arena & Badminton",
      sport: "Badminton & Turf",
      location: "OMR, Perungudi, Chennai (4.5 km)",
      address: "32 Industrial Estate, Perungudi, OMR, Chennai - 600096",
      hourlyRate: 1200,
      advanceType: "FIXED",
      advanceValue: 400, // 400 INR fixed advance
      imageUrl: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1000&q=80",
      availableDates: ["Today, 21 Nov", "Tomorrow, 22 Nov", "Sat, 23 Nov"],
      slots: ["6:00 AM - 7:00 AM", "7:00 AM - 8:00 AM", "6:00 PM - 7:00 PM", "7:00 PM - 8:00 PM"],
      amenities: ["BWF Approved Flooring", "Air Conditioned Courts", "Shower Facilities"],
    },
    {
      id: "fac-3",
      name: "Clay Court Tennis Club",
      sport: "Tennis",
      location: "Adyar, Chennai (5.8 km)",
      address: "Kasturba Nagar, Adyar, Chennai - 600020",
      hourlyRate: 1600,
      advanceType: "PERCENTAGE",
      advanceValue: 50,
      imageUrl: "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=1000&q=80",
      availableDates: ["Today, 21 Nov", "Tomorrow, 22 Nov"],
      slots: ["6:00 AM - 7:00 AM", "7:00 AM - 8:00 AM", "5:00 PM - 6:00 PM"],
      amenities: ["Clay Courts", "Racket Rentals", "Pro Coaches Available"],
    },
  ];

  const activeFacility = facilities.find((f) => f.id === selectedFacilityId) || facilities[0];

  // Pricing calculations
  const totalAmount = activeFacility.hourlyRate * selectedDuration;
  const advanceAmount =
    activeFacility.advanceType === "PERCENTAGE"
      ? Math.round((totalAmount * activeFacility.advanceValue) / 100)
      : Math.min(totalAmount, activeFacility.advanceValue);
  const remainingPayment = totalAmount - advanceAmount;

  const handleConfirmSlotBooking = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    const bookingRef = `TRF-${Math.floor(100000 + Math.random() * 900000)}`;
    setConfirmedBookingId(bookingRef);
    setBookingConfirmed(true);
  };

  const filteredFacilities =
    selectedSport === "All Sports"
      ? facilities
      : facilities.filter((f) => f.sport.toLowerCase().includes(selectedSport.toLowerCase()));

  return (
    <div className="min-h-screen bg-[#000000] text-white">
      {/* Top Breadcrumb */}
      <div className="border-b border-[#292929] bg-[#0A0A0A]">
        <div className="mx-auto flex max-w-[1440px] items-center gap-2 px-4 py-3.5 text-xs text-[#777777] sm:px-8 lg:px-12">
          <Link to="/" className="hover:text-white">Home</Link>
          <ChevronRight size={13} />
          <span className="text-white font-medium">Sports Facility & Turf Booking</span>
        </div>
      </div>

      <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-8 lg:px-12">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl sm:text-4xl font-black uppercase tracking-tight text-white">
              Sports Facilities & Turf in Chennai
            </h1>
            <p className="mt-1 text-xs text-[#BDBDBD]">
              Book real-time slots with advance deposit configuration, guaranteed court holding, and zero overlapping.
            </p>
          </div>

          {/* Sport Categories Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2 text-xs font-bold uppercase tracking-wider">
            {["All Sports", "Football", "Cricket", "Badminton", "Tennis"].map((sport) => (
              <button
                key={sport}
                onClick={() => setSelectedSport(sport)}
                className={`whitespace-nowrap rounded-xl border px-4 py-2 transition ${
                  selectedSport === sport
                    ? "border-[#ED1C24] bg-[#ED1C24] text-white"
                    : "border-[#292929] bg-[#111111] text-[#BDBDBD] hover:border-[#777777]"
                }`}
              >
                {sport}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          {/* ================= LEFT / FACILITIES SELECTOR & DETAILS (7 cols) ================= */}
          <div className="lg:col-span-7 space-y-6">
            {/* Active Facility Hero Image & Overview */}
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-3xl border border-[#292929] bg-[#111111] shadow-2xl">
              <img
                src={activeFacility.imageUrl}
                alt={activeFacility.name}
                className="size-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                <div>
                  <span className="rounded bg-[#ED1C24] px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                    {activeFacility.sport}
                  </span>
                  <h2 className="mt-1 text-xl sm:text-2xl font-black text-white">{activeFacility.name}</h2>
                  <p className="mt-0.5 flex items-center gap-1.5 text-xs text-[#BDBDBD]">
                    <MapPin size={13} className="text-[#ED1C24]" />
                    {activeFacility.location}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase text-[#777777]">Starting from</span>
                  <p className="font-display text-2xl font-black text-[#ED1C24]">
                    ₹{activeFacility.hourlyRate}
                    <span className="text-xs font-normal text-[#777777]">/hr</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Address & Amenities */}
            <div className="rounded-2xl border border-[#292929] bg-[#111111] p-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-2">Location & Address</h3>
              <p className="text-xs text-[#BDBDBD] leading-relaxed">{activeFacility.address}</p>

              <h3 className="text-xs font-bold uppercase tracking-wider text-white mt-4 mb-2">Amenities</h3>
              <div className="flex flex-wrap gap-2">
                {activeFacility.amenities.map((item) => (
                  <span
                    key={item}
                    className="rounded-lg border border-[#292929] bg-[#0A0A0A] px-2.5 py-1 text-[11px] font-semibold text-[#BDBDBD]"
                  >
                    ✓ {item}
                  </span>
                ))}
              </div>
            </div>

            {/* Facilities Switcher Cards */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
                Other Nearby Venues ({filteredFacilities.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredFacilities.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setSelectedFacilityId(f.id)}
                    className={`flex items-center gap-3 rounded-2xl border p-3 text-left transition ${
                      selectedFacilityId === f.id
                        ? "border-[#ED1C24] bg-[#171717]"
                        : "border-[#292929] bg-[#0A0A0A] hover:border-[#777777]"
                    }`}
                  >
                    <img src={f.imageUrl} alt={f.name} className="size-14 rounded-xl object-cover shrink-0" />
                    <div className="overflow-hidden">
                      <h4 className="text-xs font-bold text-white truncate">{f.name}</h4>
                      <p className="text-[11px] text-[#777777] truncate">{f.location}</p>
                      <span className="text-xs font-bold text-[#ED1C24]">₹{f.hourlyRate}/hr</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ================= RIGHT / TIME-SLOT & ADVANCE PAYMENT CONFIGURATOR (5 cols) ================= */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 rounded-3xl border border-[#292929] bg-[#111111] p-6 shadow-2xl space-y-6">
              <h2 className="font-display text-lg font-black uppercase tracking-wider text-white">
                Book a Slot
              </h2>

              {/* 1. Date Selector */}
              <div>
                <label className="text-xs font-semibold text-[#BDBDBD] mb-2 block">1. Select Date</label>
                <div className="grid grid-cols-2 gap-2">
                  {activeFacility.availableDates.map((d) => (
                    <button
                      key={d}
                      onClick={() => setSelectedDate(d)}
                      className={`rounded-xl border py-2 px-3 text-xs font-bold transition text-center ${
                        selectedDate === d
                          ? "border-[#ED1C24] bg-[#ED1C24] text-white"
                          : "border-[#292929] bg-[#0A0A0A] text-[#BDBDBD] hover:border-[#777777]"
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Duration Selector */}
              <div>
                <label className="text-xs font-semibold text-[#BDBDBD] mb-2 block">2. Duration</label>
                <div className="grid grid-cols-2 gap-2">
                  {[1, 2].map((hrs) => (
                    <button
                      key={hrs}
                      onClick={() => setSelectedDuration(hrs)}
                      className={`rounded-xl border py-2 text-xs font-bold transition ${
                        selectedDuration === hrs
                          ? "border-[#ED1C24] bg-[#ED1C24]/10 text-[#ED1C24] border-2"
                          : "border-[#292929] bg-[#0A0A0A] text-[#BDBDBD] hover:border-[#777777]"
                      }`}
                    >
                      {hrs} Hour ({hrs * 60} mins)
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Slot Selector */}
              <div>
                <label className="text-xs font-semibold text-[#BDBDBD] mb-2 block">3. Available Time Slots</label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto no-scrollbar">
                  {activeFacility.slots.map((slot) => {
                    const isSelected = selectedSlot === slot;
                    return (
                      <button
                        key={slot}
                        onClick={() => setSelectedSlot(slot)}
                        className={`rounded-xl border p-2 text-xs font-semibold transition ${
                          isSelected
                            ? "border-[#ED1C24] bg-[#ED1C24] text-white shadow-md shadow-[#ED1C24]/30"
                            : "border-[#292929] bg-[#0A0A0A] text-[#BDBDBD] hover:border-[#777777]"
                        }`}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4. Customer Information Form */}
              <div className="border-t border-[#292929] pt-4 space-y-3">
                <label className="text-xs font-semibold text-[#BDBDBD] block">4. Player Information</label>
                <div>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Full Name"
                    className="w-full rounded-xl border border-[#292929] bg-[#0A0A0A] p-2.5 text-xs text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="Phone Number"
                    className="rounded-xl border border-[#292929] bg-[#0A0A0A] p-2.5 text-xs text-white"
                  />
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="Email Address"
                    className="rounded-xl border border-[#292929] bg-[#0A0A0A] p-2.5 text-xs text-white"
                  />
                </div>
              </div>

              {/* 5. Advance Payment Breakdown */}
              <div className="border-t border-[#292929] pt-4 space-y-2 text-xs">
                <div className="flex justify-between text-[#BDBDBD]">
                  <span>Facility Rate (₹{activeFacility.hourlyRate}/hr × {selectedDuration} hr)</span>
                  <span className="text-white font-medium">₹{totalAmount}</span>
                </div>
                <div className="flex justify-between text-[#16A34A] font-semibold bg-[#16A34A]/10 p-2 rounded-lg">
                  <span>
                    Advance Deposit ({activeFacility.advanceType === "PERCENTAGE" ? `${activeFacility.advanceValue}%` : "Fixed"})
                  </span>
                  <span>₹{advanceAmount}</span>
                </div>
                <div className="flex justify-between text-[#777777]">
                  <span>Pay at Venue (Remaining)</span>
                  <span>₹{remainingPayment}</span>
                </div>
                <div className="flex justify-between border-t border-[#292929] pt-2 text-sm font-extrabold text-white">
                  <span>Pay Now to Hold Slot</span>
                  <span className="text-[#ED1C24]">₹{advanceAmount}</span>
                </div>
              </div>

              {/* Confirmation CTA */}
              <button
                onClick={handleConfirmSlotBooking}
                className="w-full rounded-xl bg-[#ED1C24] py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-[#ED1C24]/30 hover:bg-[#FF3038] transition"
              >
                Pay Advance ₹{advanceAmount} & Confirm Slot
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#777777]">
                <ShieldCheck size={12} className="text-[#16A34A]" />
                <span>Prevents double-booking • Free cancellation up to 6 hours before slot</span>
              </div>
            </div>
          </div>
        </div>

        {/* Confirmation Modal */}
        {bookingConfirmed && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
            <div className="w-full max-w-md rounded-3xl border border-[#292929] bg-[#111111] p-6 text-center shadow-2xl">
              <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-[#16A34A]/20 text-[#16A34A] mb-4">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="text-xl font-bold text-white">Turf Slot Reserved!</h3>
              <p className="mt-2 text-xs text-[#BDBDBD]">
                Slot for {activeFacility.name} on {selectedDate} ({selectedSlot}) has been confirmed.
              </p>
              <div className="mt-4 rounded-xl border border-[#292929] bg-[#0A0A0A] p-3 text-xs text-left space-y-1">
                <p className="text-[#777777]">Booking ID: <span className="font-bold text-white">{confirmedBookingId}</span></p>
                <p className="text-[#777777]">Advance Paid: <span className="font-bold text-[#16A34A]">₹{advanceAmount}</span></p>
                <p className="text-[#777777]">Balance at Venue: <span className="font-bold text-white">₹{remainingPayment}</span></p>
              </div>
              <div className="mt-6 flex gap-3">
                <Link
                  to="/my-bookings"
                  className="flex-1 rounded-xl bg-[#ED1C24] py-2.5 text-xs font-bold uppercase text-white hover:bg-[#FF3038]"
                >
                  View Bookings
                </Link>
                <button
                  onClick={() => setBookingConfirmed(false)}
                  className="flex-1 rounded-xl border border-[#292929] bg-[#171717] py-2.5 text-xs font-semibold text-white hover:bg-[#262626]"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
