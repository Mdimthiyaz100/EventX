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

export interface OrganizerDashboardMetrics {
  stats: {
    totalBookings: number;
    totalBookingsGrowth: string;
    totalRevenue: number;
    totalRevenueGrowth: string;
    activeListings: number;
    pendingApproval: number;
    rejectedListings: number;
    totalListings: number;
  };
  statusDistribution: {
    approved: number;
    pending: number;
    rejected: number;
    total: number;
  };
  bookingsTimeline: Array<{
    date: string;
    label: string;
    count: number;
  }>;
  recentListings: Array<{
    id: string;
    title: string;
    category: string;
    venue: string;
    city: string;
    status: "Approved" | "Pending" | "Rejected";
    rawStatus: string;
    bookingsCount: number;
    imageUrl?: string | null;
    createdAt: string;
  }>;
  recentActivity: Array<{
    id: string;
    type: string;
    title: string;
    subtitle: string;
    timestamp: string;
    status: string;
  }>;
}

export interface OrganizerBookingRecord {
  id: string;
  bookingId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  listingTitle: string;
  category: string;
  venue: string;
  bookingDate: string;
  amount: number;
  paymentStatus: "PAID" | "PENDING" | "FAILED" | "REFUNDED";
  bookingStatus: "CONFIRMED" | "PENDING" | "CANCELLED";
  ticketsCount: number;
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

  async deleteEvent(id: string): Promise<{ message: string }> {
    return apiRequest<{ message: string }>("DELETE", `/organizer/events/${id}`);
  },

  async getDashboardMetrics(): Promise<OrganizerDashboardMetrics> {
    return apiRequest<OrganizerDashboardMetrics>("GET", "/organizer/dashboard-metrics");
  },

  async getBookings(): Promise<OrganizerBookingRecord[]> {
    return apiRequest<OrganizerBookingRecord[]>("GET", "/organizer/bookings");
  },

  async getAttendees(eventId: string): Promise<AttendeeItem[]> {
    return apiRequest<AttendeeItem[]>("GET", `/organizer/events/${eventId}/attendees`);
  },

  async checkInTicket(eventId: string, qrToken: string): Promise<{ success: boolean; message: string }> {
    return apiRequest<{ success: boolean; message: string }>("POST", `/organizer/events/${eventId}/check-in`, { qrToken });
  },
};
