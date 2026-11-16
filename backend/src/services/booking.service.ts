import {
  BookingStatus,
  EventStatus,
  PaymentStatus,
  Prisma,
} from "@prisma/client";
import { prisma } from "../config/database.js";
import { AppError } from "../utils/http.js";

interface BookingInput {
  eventId: string;
  items: Array<{ ticketTypeId: string; quantity: number }>;
}

export async function createBooking(
  userId: string,
  input: BookingInput,
  idempotencyKey: string,
) {
  try {
    return await prisma.$transaction(
      async (transaction) => {
        const existing = await transaction.booking.findUnique({
          where: { userId_idempotencyKey: { userId, idempotencyKey } },
          include: { items: true, payment: true },
        });
        if (existing) return existing;

        const event = await transaction.event.findFirst({
          where: {
            id: input.eventId,
            status: EventStatus.PUBLISHED,
            startAt: { gt: new Date() },
          },
          select: { id: true },
        });
        if (!event) throw new AppError(404, "EVENT_NOT_AVAILABLE", "This event is not available for booking.");

        const ticketTypes = await transaction.ticketType.findMany({
          where: {
            eventId: event.id,
            id: { in: input.items.map((item) => item.ticketTypeId) },
          },
        });
        if (ticketTypes.length !== input.items.length) {
          throw new AppError(400, "INVALID_TICKET_TYPE", "One or more ticket types do not belong to this event.");
        }

        let totalAmount = new Prisma.Decimal(0);
        for (const item of input.items) {
          const ticketType = ticketTypes.find((candidate) => candidate.id === item.ticketTypeId);
          if (!ticketType) {
            throw new AppError(400, "INVALID_TICKET_TYPE", "Ticket type was not found.");
          }
          const reserved = await transaction.ticketType.updateMany({
            where: {
              id: ticketType.id,
              eventId: event.id,
              sold: { lte: ticketType.capacity - item.quantity },
            },
            data: { sold: { increment: item.quantity } },
          });
          if (reserved.count !== 1) {
            throw new AppError(409, "TICKETS_UNAVAILABLE", "Not enough tickets are available.");
          }
          totalAmount = totalAmount.plus(ticketType.price.mul(item.quantity));
        }

        return transaction.booking.create({
          data: {
            userId,
            eventId: event.id,
            totalAmount,
            idempotencyKey,
            expiresAt: new Date(Date.now() + 15 * 60 * 1000),
            items: {
              create: input.items.map((item) => {
                const ticketType = ticketTypes.find(
                  (candidate) => candidate.id === item.ticketTypeId,
                );
                if (!ticketType) {
                  throw new AppError(400, "INVALID_TICKET_TYPE", "Ticket type was not found.");
                }
                return {
                  ticketTypeId: ticketType.id,
                  quantity: item.quantity,
                  unitPrice: ticketType.price,
                };
              }),
            },
            payment: {
              create: {
                amount: totalAmount,
                currency: "INR",
                status: PaymentStatus.PENDING,
              },
            },
          },
          include: { items: true, payment: true, event: true },
        });
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      const existing = await prisma.booking.findUnique({
        where: { userId_idempotencyKey: { userId, idempotencyKey } },
        include: { items: true, payment: true },
      });
      if (existing) return existing;
    }
    throw error;
  }
}

export async function listUserBookings(userId: string, page: number, limit: number) {
  const where = { userId };
  const [total, bookings] = await prisma.$transaction([
    prisma.booking.count({ where }),
    prisma.booking.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: { event: true, items: { include: { ticketType: true } }, payment: true, tickets: true },
    }),
  ]);
  return { bookings, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
}

export async function cancelPendingBooking(userId: string, bookingId: string) {
  return prisma.$transaction(async (transaction) => {
    const booking = await transaction.booking.findFirst({
      where: { id: bookingId, userId },
      include: { items: true, payment: true },
    });
    if (!booking) throw new AppError(404, "BOOKING_NOT_FOUND", "Booking not found.");
    if (booking.status !== BookingStatus.PENDING) {
      throw new AppError(409, "BOOKING_NOT_CANCELLABLE", "Only pending bookings can be cancelled.");
    }
    if (booking.payment?.providerReferenceId) {
      throw new AppError(
        409,
        "PAYMENT_ORDER_ACTIVE",
        "This booking has an active payment order and cannot be cancelled yet.",
      );
    }

    const updated = await transaction.booking.updateMany({
      where: { id: booking.id, status: BookingStatus.PENDING },
      data: { status: BookingStatus.CANCELLED },
    });
    if (updated.count !== 1) {
      throw new AppError(409, "BOOKING_NOT_CANCELLABLE", "Booking status has changed.");
    }
    for (const item of booking.items) {
      await transaction.ticketType.update({
        where: { id: item.ticketTypeId },
        data: { sold: { decrement: item.quantity } },
      });
    }
    if (booking.payment) {
      await transaction.payment.update({
        where: { id: booking.payment.id },
        data: { status: PaymentStatus.FAILED },
      });
    }
    return { id: booking.id, status: BookingStatus.CANCELLED };
  });
}

export async function listEventAttendees(
  organizerId: string,
  eventId: string,
  page: number,
  limit: number,
) {
  const event = await prisma.event.findFirst({
    where: { id: eventId, organizerId },
    select: { id: true },
  });
  if (!event) throw new AppError(404, "EVENT_NOT_FOUND", "Event not found.");

  const where = {
    eventId,
    booking: { status: BookingStatus.CONFIRMED },
  };
  const [total, tickets] = await prisma.$transaction([
    prisma.ticket.count({ where }),
    prisma.ticket.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        checkedInAt: true,
        createdAt: true,
        booking: {
          select: {
            user: { select: { id: true, name: true, email: true } },
            items: { select: { ticketType: { select: { name: true } } } },
          },
        },
      },
    }),
  ]);
  return { tickets, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
}