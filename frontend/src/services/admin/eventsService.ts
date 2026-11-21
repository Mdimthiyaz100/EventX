import { apiRequest } from "../api";
import type { AdminEvent, EventInput, PaginatedResult } from "../adminService";

export type { AdminEvent, EventInput };

export async function listAdminEvents(params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  category?: string;
}): Promise<{ events: AdminEvent[]; pagination: PaginatedResult<AdminEvent>["pagination"] }> {
  return apiRequest("GET", "/admin/events", undefined, params);
}

export async function getAdminEvent(id: string): Promise<AdminEvent> {
  return apiRequest<AdminEvent>("GET", `/admin/events/${encodeURIComponent(id)}`);
}

export async function createAdminEvent(data: EventInput): Promise<AdminEvent> {
  return apiRequest<AdminEvent>("POST", "/admin/events", data);
}

export async function updateAdminEvent(id: string, data: Partial<EventInput>): Promise<AdminEvent> {
  return apiRequest<AdminEvent>("PUT", `/admin/events/${encodeURIComponent(id)}`, data);
}

export async function deleteAdminEvent(id: string): Promise<AdminEvent> {
  return apiRequest<AdminEvent>("DELETE", `/admin/events/${encodeURIComponent(id)}`);
}

export async function reviewAdminEvent(id: string, publish: boolean): Promise<AdminEvent> {
  return apiRequest<AdminEvent>("PATCH", `/admin/events/${encodeURIComponent(id)}/review`, { publish });
}

export const listEvents = listAdminEvents;
export const getEvent = getAdminEvent;
export const createEvent = createAdminEvent;
export const updateEvent = updateAdminEvent;
export const deleteEvent = deleteAdminEvent;
export const setEventReview = reviewAdminEvent;

export default {
  listAdminEvents,
  getAdminEvent,
  createAdminEvent,
  updateAdminEvent,
  deleteAdminEvent,
  reviewAdminEvent,
};
