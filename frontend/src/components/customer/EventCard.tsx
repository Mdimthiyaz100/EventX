import { Link } from "react-router-dom";
import { Calendar, MapPin, Heart } from "lucide-react";
import type { EventItem } from "../../types/content";
import { useWishlist } from "../../context/WishlistContext";

interface EventCardProps {
  event: EventItem;
}

export default function EventCard({ event }: EventCardProps) {
  const { isWishlisted, toggleWishlist } = useWishlist();
  const wishlisted = isWishlisted(event.id);

  const formattedDate = event.startDate || event.startAt
    ? new Intl.DateTimeFormat("en-IN", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      }).format(new Date(event.startDate || event.startAt))
    : "Date TBA";

  const lowestPrice =
    typeof event.price === "number"
      ? event.price
      : event.ticketTypes && event.ticketTypes.length > 0
      ? Math.min(...event.ticketTypes.map((t) => Number(t.price)))
      : 0;

  // Category badge color accents
  const getBadgeStyle = (category: string) => {
    const c = category.toLowerCase();
    if (c.includes("comedy")) return "bg-purple-600/80 text-purple-100 border-purple-500/40";
    if (c.includes("concert") || c.includes("music")) return "bg-pink-600/80 text-pink-100 border-pink-500/40";
    if (c.includes("theatre") || c.includes("drama")) return "bg-amber-600/80 text-amber-100 border-amber-500/40";
    if (c.includes("sports")) return "bg-emerald-600/80 text-emerald-100 border-emerald-500/40";
    return "bg-blue-600/80 text-blue-100 border-blue-500/40";
  };

  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-[#161224]/80 backdrop-blur-md transition-all duration-300 hover:border-white/20 hover:shadow-2xl hover:shadow-red-950/20 hover:-translate-y-1">
      {/* Top Media Section */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-900">
        {event.imageUrl ? (
          <img
            src={event.imageUrl}
            alt={event.title}
            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex size-full flex-col items-center justify-center bg-[#130E20] text-slate-500 p-4 text-center">
            <span className="text-2xl mb-1">🎟️</span>
            <span className="text-[11px] font-semibold text-slate-400">Event Image Pending</span>
          </div>
        )}

        {/* Gradient shadow overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#161224] via-transparent to-black/40" />

        {/* Category Pill Tag */}
        <div className="absolute top-3 left-3">
          <span
            className={`inline-block rounded-md border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider backdrop-blur-md ${getBadgeStyle(
              event.category
            )}`}
          >
            {event.category}
          </span>
        </div>

        {/* Wishlist Heart Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(event.id);
          }}
          className="absolute top-3 right-3 grid size-8 place-items-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-md transition hover:scale-110 hover:bg-black/60"
          title={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart
            size={15}
            className={wishlisted ? "fill-[#E31824] text-[#E31824]" : "text-white"}
          />
        </button>
      </div>

      {/* Card Info Content */}
      <div className="flex flex-1 flex-col justify-between p-4 sm:p-5">
        <div>
          <Link to={`/events/${event.id}`}>
            <h3 className="font-display text-lg font-bold uppercase tracking-wide text-white transition hover:text-[#E31824] line-clamp-1">
              {event.title}
            </h3>
          </Link>

          {/* Date & Time */}
          <div className="mt-2.5 flex items-center gap-1.5 text-xs text-slate-400">
            <Calendar size={13} className="shrink-0 text-slate-400" />
            <span className="truncate">{formattedDate}</span>
          </div>

          {/* Venue & Location */}
          <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
            <MapPin size={13} className="shrink-0 text-slate-400" />
            <span className="truncate">{event.venue || event.location || event.city}</span>
          </div>
        </div>

        {/* Bottom Pricing & CTA */}
        <div className="mt-5 flex items-center justify-between border-t border-white/5 pt-3.5">
          <div>
            <span className="block text-[10px] font-medium uppercase tracking-wider text-slate-400">
              {lowestPrice === 0 ? "Entry" : "From"}
            </span>
            <span className="font-display text-base font-extrabold text-white">
              {lowestPrice === 0
                ? "FREE"
                : new Intl.NumberFormat("en-IN", {
                    style: "currency",
                    currency: "INR",
                    maximumFractionDigits: 0,
                  }).format(lowestPrice)}
            </span>
          </div>

          <Link
            to={`/events/${event.id}`}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#E31824] px-4 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-red-600/25 transition hover:bg-[#c8141f] active:scale-95"
          >
            <span>Book Now</span>
            <span className="text-xs">&rarr;</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
