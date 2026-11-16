import type { EventCategory, EventSummary } from "../types/event";
import { apiGet } from "./api";

const categories = new Set<EventCategory>([
  "Music",
  "Tech",
  "Food",
  "Sports",
  "Festival",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseEvent(value: unknown): EventSummary | null {
  if (!isRecord(value)) return null;

  const { id, title, category, location, startDate, price, imageUrl, description } =
    value;
  if (
    (typeof id !== "string" && typeof id !== "number") ||
    typeof title !== "string" ||
    typeof category !== "string" ||
    !categories.has(category as EventCategory) ||
    typeof location !== "string" ||
    typeof startDate !== "string" ||
    typeof price !== "number" ||
    typeof imageUrl !== "string"
  ) {
    return null;
  }

  return {
    id: String(id),
    title,
    category: category as EventCategory,
    location,
    startDate,
    price,
    imageUrl,
    description: typeof description === "string" ? description : "",
  };
}

export async function getFeaturedEvents(
  signal?: AbortSignal,
): Promise<EventSummary[]> {
  const payload = await apiGet("/events?featured=true", signal);
  const records = Array.isArray(payload)
    ? payload
    : isRecord(payload) && Array.isArray(payload.data)
      ? payload.data
      : isRecord(payload) && Array.isArray(payload.events)
        ? payload.events
        : null;

  if (!records) {
    throw new Error("The events service returned an unexpected response.");
  }

  const events = records.map(parseEvent);
  if (events.some((event) => event === null)) {
    throw new Error("The events service returned an invalid event.");
  }

  return events.filter((event): event is EventSummary => event !== null);
}

export const demoEvents: EventSummary[] = [
  {
    id: "arijit-live-chennai",
    title: "Arijit Live in Chennai",
    category: "Music",
    location: "Chennai",
    startDate: "2026-12-20T19:00:00+05:30",
    price: 1999,
    imageUrl:
      "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1000&q=85",
    description:
      "An unforgettable night of live music, big anthems, and a crowd singing every word.",
  },
  {
    id: "chennai-food-carnival",
    title: "Chennai Food Carnival",
    category: "Food",
    location: "Chennai",
    startDate: "2026-12-12T12:00:00+05:30",
    price: 499,
    imageUrl:
      "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1000&q=85",
    description:
      "A weekend celebrating the city's favorite flavors, new kitchens, and local makers.",
  },
  {
    id: "dev-summit-2026",
    title: "Dev Summit 2026",
    category: "Tech",
    location: "Bengaluru",
    startDate: "2027-01-10T09:00:00+05:30",
    price: 2499,
    imageUrl:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1000&q=85",
    description:
      "Meet the builders shaping what's next in product, engineering, and technology.",
  },
  {
    id: "beach-music-festival",
    title: "Beach Music Festival",
    category: "Festival",
    location: "Pondicherry",
    startDate: "2027-01-24T16:00:00+05:30",
    price: 899,
    imageUrl:
      "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=1000&q=85",
    description:
      "Golden-hour sets, open skies, and your favorite artists by the water.",
  },
  {
    id: "city-football-finals",
    title: "City Football Finals",
    category: "Sports",
    location: "Mumbai",
    startDate: "2027-02-08T17:30:00+05:30",
    price: 699,
    imageUrl:
      "https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=1000&q=85",
    description:
      "Feel every tackle, cheer, and last-minute goal from the best seats in the house.",
  },
];