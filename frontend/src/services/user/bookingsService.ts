import { bookingService, type BookingResponse, type CreateBookingPayload } from "../booking.service";

export type { BookingResponse, CreateBookingPayload };

export async function createBooking(payload: CreateBookingPayload, idempotencyKey?: string): Promise<BookingResponse> {
  return bookingService.createBooking(payload, idempotencyKey);
}

export async function listUserBookings(): Promise<BookingResponse[]> {
  return bookingService.listMyBookings();
}

export async function cancelBooking(bookingId: string): Promise<BookingResponse> {
  return bookingService.cancelBooking(bookingId);
}

export default {
  createBooking,
  listUserBookings,
  cancelBooking,
};
