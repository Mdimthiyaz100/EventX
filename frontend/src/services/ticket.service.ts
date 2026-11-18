import { bookingService, type BookingTicket } from "./booking.service";

export interface TicketWithEvent extends BookingTicket {
  bookingId: string;
  bookingStatus: string;
  event?: {
    id: string;
    title: string;
    venue: string;
    city: string;
    startAt: string;
    imageUrl?: string;
  };
}

export const ticketService = {
  async getMyTickets(): Promise<TicketWithEvent[]> {
    const bookings = await bookingService.listMyBookings();
    const tickets: TicketWithEvent[] = [];

    for (const booking of bookings) {
      if (booking.tickets && Array.isArray(booking.tickets)) {
        for (const ticket of booking.tickets) {
          tickets.push({
            ...ticket,
            bookingId: booking.id,
            bookingStatus: booking.status,
            event: booking.event,
          });
        }
      }
    }

    return tickets;
  },
};
