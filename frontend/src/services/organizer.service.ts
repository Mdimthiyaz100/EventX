import { apiRequest } from "./api";
import type { EventItem } from "../types/content";

export interface CreateOrganizerEventPayload {
  title: string;
  description: string;
  category: string;
  venue: string;
  city: string;
  address?: string;
  startAt: string;
  endAt?: string;
  ticketTypes: {
    name: string;
    price: number;
    capacity: number;
  }[];
}

export interface AttendeeItem {
  id: string;
  ticketTypeId: string;
  price: number | string;
  status: string;
  usedAt?: string | null;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export const organizerService = {
  async getMyEvents(): Promise<EventItem[]> {
    return apiRequest<EventItem[]>("GET", "/events/organizer/mine");
  },

  async createEvent(payload: CreateOrganizerEventPayload): Promise<EventItem> {
    return apiRequest<EventItem>("POST", "/events", payload);
  },

  async updateEvent(id: string, payload: Partial<CreateOrganizerEventPayload>): Promise<EventItem> {
    return apiRequest<EventItem>("PATCH", `/events/${id}`, payload);
  },

  async getAttendees(eventId: string): Promise<AttendeeItem[]> {
    return apiRequest<AttendeeItem[]>("GET", `/organizer/events/${eventId}/attendees`);
  },

  async checkInTicket(eventId: string, qrToken: string): Promise<{ success: boolean; message: string }> {
    return apiRequest<{ success: boolean; message: string }>("POST", `/organizer/events/${eventId}/check-in`, { qrToken });
  },
};
