import { BookingStatus, PaymentStatus, Prisma } from "@prisma/client";
import { prisma } from "../config/database.js";

let running = false;

export async function expireStaleBookings(): Promise<void> {
  if (running) return;
  running = true;
  try {
    const now = new Date();
    const candidates = await prisma.booking.findMany({
      where: {
        status: BookingStatus.PENDING,
        expiresAt: { lte: now },
        payment: { is: { providerReferenceId: null } },
      },
      select: { id: true },
      take: 100,
      orderBy: { expiresAt: "asc" },
    });

    for (const candidate of candidates) {
      await prisma.$transaction(
        async (transaction) => {
          const claimed = await transaction.booking.updateMany({
            where: {
              id: candidate.id,
              status: BookingStatus.PENDING,
              expiresAt: { lte: now },
            },
            data: { status: BookingStatus.EXPIRED },
          });
          if (claimed.count !== 1) return;

          const items = await transaction.bookingItem.findMany({
            where: { bookingId: candidate.id },
          });
          for (const item of items) {
            const released = await transaction.ticketType.updateMany({
              where: {
                id: item.ticketTypeId,
                sold: { gte: item.quantity },
              },
              data: { sold: { decrement: item.quantity } },
            });
            if (released.count !== 1) {
              throw new Error(`Ticket reservation inventory mismatch for booking ${candidate.id}.`);
            }
          }
          await transaction.payment.updateMany({
            where: { bookingId: candidate.id, status: PaymentStatus.PENDING },
            data: { status: PaymentStatus.FAILED },
          });
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );
    }
  } finally {
    running = false;
  }
}
