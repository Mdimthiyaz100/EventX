import { useState } from "react";
import { Link } from "react-router-dom";
import {
  MapPin,
  Star,
  Clock,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";

interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  reviewsCount: string;
  location: string;
  timing: string;
  imageUrl: string;
  features: string[];
}

export default function Dining() {
  const selectedCity = "Chennai";

  // Reservation Form State
  const [activeRestaurant] = useState<Restaurant>({
    id: "rest-1",
    name: "The Bay Kitchen",
    cuisine: "Continental • Italian • Cafe",
    rating: 4.6,
    reviewsCount: "5.2K",
    location: "ECR, Chennai (2.1 km)",
    timing: "Open • Closes at 11:00 PM",
    imageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80",
    features: ["Dine-in", "Valet Parking", "Live Music", "Wi-Fi"],
  });

  const [resDate, setResDate] = useState("2027-01-28");
  const [selectedSlot, setSelectedSlot] = useState("7:00 PM");
  const [guestCount, setGuestCount] = useState(4);
  const [reservationSuccess, setReservationSuccess] = useState(false);

  const timeSlots = ["6:00 PM", "6:30 PM", "7:00 PM", "7:30 PM", "8:00 PM", "8:30 PM"];

  const handleReserve = () => {
    setReservationSuccess(true);
  };

  return (
    <div className="min-h-screen bg-[#000000] text-white">
      {/* Top Breadcrumb */}
      <div className="border-b border-[#292929] bg-[#0A0A0A]">
        <div className="mx-auto flex max-w-[1440px] items-center gap-2 px-4 py-3.5 text-xs text-[#777777] sm:px-8 lg:px-12">
          <Link to="/" className="hover:text-white">Home</Link>
          <ChevronRight size={13} />
          <span className="text-white font-medium">Dining & Table Reservation</span>
        </div>
      </div>

      <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-8 lg:px-12">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl sm:text-4xl font-black uppercase tracking-tight text-white">
              Dining in {selectedCity}
            </h1>
            <p className="mt-1 text-xs text-[#BDBDBD]">
              Discover top-rated restaurants, reserve guaranteed tables, and unlock exclusive EventX dining discounts.
            </p>
          </div>
        </div>

        {/* Featured Restaurant Detail & Reservation View (matching user's screenshot) */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          {/* Main Visuals & Details (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-3xl border border-[#292929] bg-[#111111]">
              <img
                src={activeRestaurant.imageUrl}
                alt={activeRestaurant.name}
                className="size-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-white">{activeRestaurant.name}</h2>
                  <p className="text-xs text-[#BDBDBD]">{activeRestaurant.cuisine}</p>
                </div>
                <div className="flex items-center gap-1 rounded-xl bg-[#16A34A] px-2.5 py-1 text-xs font-bold text-white">
                  <Star size={13} className="fill-white" />
                  <span>{activeRestaurant.rating}</span>
                </div>
              </div>
            </div>

            {/* Tags & Meta Row */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-[#BDBDBD]">
              <span className="flex items-center gap-1">
                <MapPin size={13} className="text-[#ED1C24]" />
                {activeRestaurant.location}
              </span>
              <span className="flex items-center gap-1">
                <Clock size={13} className="text-[#16A34A]" />
                {activeRestaurant.timing}
              </span>
            </div>

            {/* Description & Amenities */}
            <div className="rounded-3xl border border-[#292929] bg-[#111111] p-6 text-sm text-[#BDBDBD] leading-relaxed">
              <h3 className="font-bold text-white uppercase text-xs tracking-wider mb-2">About the Place</h3>
              <p>
                A premium dining experience with curated global cuisine, perfect for family dinners, date nights, and special occasions with serene ambiance.
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {activeRestaurant.features.map((feat) => (
                  <span
                    key={feat}
                    className="rounded-lg border border-[#292929] bg-[#0A0A0A] px-3 py-1 text-xs font-semibold text-white"
                  >
                    {feat}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Table Reservation Card (5 cols) */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 rounded-3xl border border-[#292929] bg-[#111111] p-6 shadow-2xl">
              <h2 className="font-display text-lg font-black uppercase tracking-wider text-white mb-5">
                Reserve a Table
              </h2>

              {reservationSuccess ? (
                <div className="py-8 text-center space-y-4">
                  <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-[#16A34A]/20 text-[#16A34A]">
                    <CheckCircle2 size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-white">Table Reserved!</h3>
                  <p className="text-xs text-[#BDBDBD]">
                    Table for {guestCount} confirmed at {activeRestaurant.name} on {resDate} at {selectedSlot}.
                  </p>
                  <p className="text-[11px] text-[#777777]">Reservation ID: RES-49281</p>
                  <button
                    onClick={() => setReservationSuccess(false)}
                    className="rounded-xl border border-[#292929] bg-[#171717] px-4 py-2 text-xs font-semibold text-white hover:border-[#ED1C24]"
                  >
                    Modify Reservation
                  </button>
                </div>
              ) : (
                <div className="space-y-5">
                  {/* Select Date */}
                  <div>
                    <label className="text-xs font-semibold text-[#BDBDBD] mb-1.5 block">Select Date</label>
                    <div className="relative">
                      <input
                        type="date"
                        value={resDate}
                        onChange={(e) => setResDate(e.target.value)}
                        className="w-full rounded-xl border border-[#292929] bg-[#0A0A0A] px-3.5 py-2.5 text-xs text-white focus:border-[#ED1C24] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Select Time */}
                  <div>
                    <label className="text-xs font-semibold text-[#BDBDBD] mb-2 block">Select Time Slot</label>
                    <div className="grid grid-cols-3 gap-2">
                      {timeSlots.map((slot) => {
                        const isSelected = selectedSlot === slot;
                        return (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setSelectedSlot(slot)}
                            className={`rounded-xl border py-2.5 text-xs font-bold transition ${
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

                  {/* Select Guests */}
                  <div>
                    <label className="text-xs font-semibold text-[#BDBDBD] mb-1.5 block">Guests</label>
                    <select
                      value={guestCount}
                      onChange={(e) => setGuestCount(Number(e.target.value))}
                      className="w-full rounded-xl border border-[#292929] bg-[#0A0A0A] px-3.5 py-2.5 text-xs text-white focus:border-[#ED1C24] focus:outline-none"
                    >
                      {[1, 2, 3, 4, 5, 6, 8, 10, 12].map((num) => (
                        <option key={num} value={num}>
                          {num} {num === 1 ? "Guest" : "Guests"}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Reservation CTA */}
                  <button
                    onClick={handleReserve}
                    className="w-full rounded-xl bg-[#ED1C24] py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-[#ED1C24]/30 transition hover:bg-[#FF3038]"
                  >
                    Reserve Table
                  </button>

                  <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#777777]">
                    <ShieldCheck size={12} className="text-[#16A34A]" />
                    <span>Free cancellation up to 1 hour before reservation</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
