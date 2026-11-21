import { eventService, type EventListParams, type EventListResponse } from "../event.service";
import type { EventItem } from "../../types/content";

export type { EventListParams, EventListResponse };

export async function getPublicEvents(params?: EventListParams): Promise<EventListResponse | EventItem[]> {
  return eventService.getEvents(params);
}

export async function getPublicEventById(id: string): Promise<EventItem> {
  return eventService.getEventById(id);
}

export default {
  getPublicEvents,
  getPublicEventById,
};
