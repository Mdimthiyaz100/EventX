import { CalendarDays, Heart, MapPin, Ticket } from "lucide-react";
import { useState } from "react";
import type { EventSummary } from "../../types/event";
import Button from "../common/Button";

interface EventCardProps {
  event: EventSummary;
  onBook: (event: EventSummary) => void;
}

const categoryColors: Record<string, string> = {
  Music: "bg-rose-100 text-rose-800",
  Tech: "bg-sky-100 text-sky-800",
  Food: "bg-orange-100 text-orange-800",
  Sports: "bg-emerald-100 text-emerald-800",
  Festival: "bg-violet-100 text-violet-800",
};

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

const priceFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export default function EventCard({ event, onBook }: EventCardProps) {
  const [saved, setSaved] = useState(false);
  const [imageUrl, setImageUrl] = useState(
    event.imageUrl || "/images/event-placeholder.svg",
  );
  const date = new Date(event.startDate);
  const formattedDate = Number.isNaN(date.getTime())
    ? "Date to be announced"
    : dateFormatter.format(date);

  return (
    <article className="event-card group overflow-hidden rounded-2xl border border-ink/5 bg-paper shadow-[0_6px_20px_rgba(27,20,15,.07)] transition duration-300 hover:-translate-y-1 hover:shadow-soft">
      <div className="relative h-52 overflow-hidden bg-ink/10">
        <img
          alt={event.title}
          className="size-full object-cover transition duration-700 group-hover:scale-105"
          loading="lazy"
          onError={() => setImageUrl("/images/event-placeholder.svg")}
          src={imageUrl}
        />
        <span
          className={`absolute left-3 top-3 rounded-full px-3 py-1 text-[11px] font-bold ${categoryColors[event.category] ?? "bg-white text-ink"}`}
        >
          {event.category}
        </span>
        <button
          aria-label={saved ? `Remove ${event.title} from saved events` : `Save ${event.title}`}
          aria-pressed={saved}
          className={`absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-white/90 shadow-sm backdrop-blur transition hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eventx ${
            saved ? "text-eventx" : "text-ink"
          }`}
          onClick={() => setSaved((current) => !current)}
          type="button"
        >
          <Heart aria-hidden="true" fill={saved ? "currentColor" : "none"} size={17} />
        </button>
      </div>
      <div className="p-4">
        <h3 className="min-h-12 font-display text-[1.4rem] font-bold uppercase leading-[1.05] tracking-tight text-ink">
          {event.title}
        </h3>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-ink/70">
          <span className="inline-flex items-center gap-1.5">
            <MapPin aria-hidden="true" size={14} />
            {event.location}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays aria-hidden="true" size={14} />
            <time dateTime={event.startDate}>{formattedDate}</time>
          </span>
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-ink/10 pt-3">
          <span className="text-xs text-ink/60">
            From{" "}
            <strong className="text-sm font-extrabold text-ink">
              {priceFormatter.format(event.price)}
            </strong>
          </span>
          <Button
            className="min-h-10 rounded-lg px-3.5 py-2 text-xs"
            onClick={() => onBook(event)}
          >
            <Ticket aria-hidden="true" size={14} />
            Book now
          </Button>
        </div>
      </div>
    </article>
  );
}