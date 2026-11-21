import { organizerService, type CreateOrganizerEventPayload } from "../organizer.service";
import type { EventItem } from "../../types/content";

export type { CreateOrganizerEventPayload };

export async function getMyEvents(): Promise<EventItem[]> {
  return organizerService.getMyEvents();
}

export async function createOrganizerEvent(payload: CreateOrganizerEventPayload): Promise<EventItem> {
  return organizerService.createEvent(payload);
}

export async function updateOrganizerEvent(id: string, payload: Partial<CreateOrganizerEventPayload>): Promise<EventItem> {
  return organizerService.updateEvent(id, payload);
}

export default {
  getMyEvents,
  createOrganizerEvent,
  updateOrganizerEvent,
};
