import type { EventCategory, EventSummary } from "../types/event";
import type { EventItem } from "../types/content";
import { apiGet } from "./api";

export interface EventListParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  city?: string;
  featured?: boolean;
}

export interface EventListResponse {
  events: EventItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const eventService = {
  async getEvents(params?: EventListParams): Promise<EventListResponse | EventItem[]> {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    if (params?.search) query.set("search", params.search);
    if (params?.category) query.set("category", params.category);
    if (params?.city) query.set("city", params.city);
    if (params?.featured !== undefined) query.set("featured", String(params.featured));

    const qs = query.toString();
    return apiGet(`/events${qs ? `?${qs}` : ""}`) as Promise<EventListResponse | EventItem[]>;
  },

  async getEventById(id: string): Promise<EventItem> {
    return apiGet(`/events/${encodeURIComponent(id)}`) as Promise<EventItem>;
  },

  async getCategories(): Promise<string[]> {
    return apiGet("/categories") as Promise<string[]>;
  },

  async getCities(): Promise<string[]> {
    return apiGet("/cities") as Promise<string[]>;
  },
};

export async function getFeaturedEvents(signal?: AbortSignal): Promise<EventSummary[]> {
  const payload = await apiGet("/events?featured=true", signal);
  const records = Array.isArray(payload)
    ? payload
    : typeof payload === "object" && payload !== null && "events" in payload && Array.isArray((payload as { events: unknown[] }).events)
      ? (payload as { events: unknown[] }).events
      : [];

  return (records as Record<string, unknown>[]).map((item) => ({
    id: String(item.id ?? ""),
    title: String(item.title ?? ""),
    category: (item.category ?? "Music") as EventCategory,
    location: String(item.city ?? item.location ?? ""),
    startDate: String(item.startAt ?? item.startDate ?? ""),
    price: Number(item.price ?? 0),
    imageUrl: String(item.imageUrl ?? ""),
    description: String(item.description ?? ""),
  }));
}
