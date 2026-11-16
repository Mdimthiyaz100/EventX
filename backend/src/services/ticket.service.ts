import { BookingStatus } from "@prisma/client";
import { prisma } from "../config/database.js";
import { AppError } from "../utils/http.js";

export async function checkIn(
  organizerId: string,
  eventId: string,
  qrToken: string,
) {
  const ticket = await prisma.ticket.findFirst({
    where: {
      eventId,
      qrToken,
      booking: { status: BookingStatus.CONFIRMED },
    },
    select: { id: true, checkedInAt: true },
  });
  if (!ticket) throw new AppError(404, "TICKET_INVALID", "Ticket is invalid for this event.");

  const ownership = await prisma.event.findFirst({
    where: { id: eventId, organizerId },
    select: { id: true },
  });
  if (!ownership) throw new AppError(404, "EVENT_NOT_FOUND", "Event not found.");
  if (ticket.checkedInAt) {
    throw new AppError(409, "TICKET_ALREADY_CHECKED_IN", "This ticket has already been checked in.");
  }

  const result = await prisma.ticket.updateMany({
    where: { id: ticket.id, eventId, checkedInAt: null },
    data: { checkedInAt: new Date() },
  });
  if (result.count !== 1) {
    throw new AppError(409, "TICKET_ALREADY_CHECKED_IN", "This ticket has already been checked in.");
  }
  return { ticketId: ticket.id, checkedInAt: new Date().toISOString() };
}