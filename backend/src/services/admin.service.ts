import { Prisma } from "@prisma/client";
import { prisma } from "../config/database.js";

export async function getDashboard() {
  const [users, organizers, events, pendingEvents, bookings, payments] =
    await prisma.$transaction([
      prisma.user.count(),
      prisma.user.count({ where: { role: "ORGANIZER" } }),
      prisma.event.count(),
      prisma.event.count({ where: { status: "DRAFT" } }),
      prisma.booking.count(),
      prisma.payment.aggregate({
        where: { status: "PAID" },
        _sum: { amount: true },
        _count: { _all: true },
      }),
    ]);
  return {
    users,
    organizers,
    events,
    pendingEvents,
    bookings,
    settledPayments: payments._count._all,
    grossRevenue: payments._sum.amount ?? new Prisma.Decimal(0),
  };
}

export async function listTransactions(
  page: number,
  limit: number,
  status?: "PENDING" | "PAID" | "FAILED" | "REFUNDED",
) {
  const where = status ? { status } : {};
  const [total, payments] = await prisma.$transaction([
    prisma.payment.count({ where }),
    prisma.payment.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        status: true,
        amount: true,
        currency: true,
        providerReferenceId: true,
        providerPaymentId: true,
        createdAt: true,
        booking: {
          select: {
            id: true,
            user: { select: { id: true, name: true, email: true } },
            event: { select: { id: true, title: true } },
          },
        },
      },
    }),
  ]);
  return { payments, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
}
