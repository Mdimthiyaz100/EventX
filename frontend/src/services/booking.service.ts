import { apiRequest } from "./api";

export interface BookingItemPayload {
  ticketTypeId: string;
  quantity: number;
}

export interface CreateBookingPayload {
  eventId: string;
  items: BookingItemPayload[];
}

export interface BookingTicket {
  id: string;
  ticketTypeId: string;
  ticketType?: {
    id: string;
    name: string;
    price: number | string;
  };
  price: number | string;
  qrToken?: string;
  status: "ISSUED" | "USED" | "CANCELLED";
  usedAt?: string | null;
}

export interface BookingResponse {
  id: string;
  userId: string;
  eventId: string;
  totalAmount: number | string;
  status: "PENDING" | "PAID" | "CANCELLED" | "EXPIRED";
  expiresAt?: string;
  createdAt: string;
  event?: {
    id: string;
    title: string;
    venue: string;
    city: string;
    startAt: string;
    imageUrl?: string;
    category?: string;
  };
  tickets?: BookingTicket[];
}

export const bookingService = {
  async createBooking(payload: CreateBookingPayload, idempotencyKey?: string): Promise<BookingResponse> {
    const key = idempotencyKey || (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `idemp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`);
    return apiRequest<BookingResponse>("POST", "/bookings", payload, undefined, {
      "Idempotency-Key": key,
    });
  },

  async listMyBookings(): Promise<BookingResponse[]> {
    return apiRequest<BookingResponse[]>("GET", "/bookings/mine");
  },

  async cancelBooking(bookingId: string): Promise<BookingResponse> {
    return apiRequest<BookingResponse>("POST", `/bookings/${bookingId}/cancel`);
  },
};
