import { Prisma } from "@prisma/client";
import { prisma } from "../config/database.js";

export async function getDashboard() {
  const since = new Date();
  since.setMonth(since.getMonth() - 5, 1);
  since.setHours(0, 0, 0, 0);
  const [users, organizers, events, pendingEvents, bookings, payments, totalMovies, activeMovies, upcomingMovies, latestMovies, recentBookings, recentEvents, paymentRows, bookingStatuses, comedyShows, diningPartners] =
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
      prisma.movie.count(),
      prisma.movie.count({ where: { status: "PUBLISHED" } }),
      prisma.movie.count({ where: { status: "PUBLISHED", releaseDate: { gt: new Date() } } }),
      prisma.movie.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
      prisma.booking.findMany({ orderBy: { createdAt: "desc" }, take: 6, include: { user: { select: { name: true, email: true } }, event: { select: { title: true } }, payment: { select: { status: true, amount: true, currency: true } } } }),
      prisma.event.findMany({ orderBy: { createdAt: "desc" }, take: 5, select: { id: true, title: true, category: true, city: true, startAt: true, status: true, imageUrl: true } }),
      prisma.payment.findMany({ where: { status: "PAID", createdAt: { gte: since } }, select: { amount: true, createdAt: true } }),
      prisma.booking.groupBy({ by: ["status"], orderBy: { status: "asc" }, _count: { status: true } }),
      prisma.event.count({ where: { category: { in: ["comedy", "Comedy", "standup", "Standup"] } } }),
      prisma.event.count({ where: { category: { in: ["dining", "Dining", "food", "Food", "restaurant", "Restaurant"] } } }),
    ]);
  const revenueByMonth = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(since.getFullYear(), since.getMonth() + index, 1);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    const total = paymentRows.reduce((sum, payment) => payment.createdAt.getFullYear() === date.getFullYear() && payment.createdAt.getMonth() === date.getMonth() ? sum + Number(payment.amount) : sum, 0);
    return { key, month: date.toLocaleString("en", { month: "short" }), revenue: total };
  });
  return {
    users,
    organizers,
    events,
    pendingEvents,
    comedyShows,
    diningPartners,
    bookings,
    totalMovies,
    activeMovies,
    upcomingMovies,
    settledPayments: payments._count._all,
    grossRevenue: payments._sum.amount ?? new Prisma.Decimal(0),
    revenueByMonth,
    bookingStats: bookingStatuses.map((row) => ({ status: row.status, count: typeof row._count === "object" && row._count !== null ? row._count.status ?? 0 : 0 })),
    recentBookings,
    latestMovies,
    recentEvents,
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

export async function listAdminEvents(page: number, limit: number, search?: string, status?: string, category?: string) {
  const where: Prisma.EventWhereInput = {
    ...(status && ["DRAFT", "PUBLISHED", "CANCELLED"].includes(status) ? { status: status as "DRAFT" | "PUBLISHED" | "CANCELLED" } : {}),
    ...(category ? { category: { contains: category } } : {}),
    ...(search ? { OR: [{ title: { contains: search } }, { city: { contains: search } }, { venue: { contains: search } }] } : {}),
  };
  const [total, events] = await prisma.$transaction([
    prisma.event.count({ where }),
    prisma.event.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * limit, take: limit,
      include: { organizer: { select: { id: true, name: true, email: true } }, _count: { select: { bookings: true } } } }),
  ]);
  return { events, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
}

export async function listAdminBookings(page: number, limit: number, search?: string, status?: string) {
  const where: Prisma.BookingWhereInput = {
    ...(status && ["PENDING", "CONFIRMED", "CANCELLED", "EXPIRED"].includes(status) ? { status: status as "PENDING" | "CONFIRMED" | "CANCELLED" | "EXPIRED" } : {}),
    ...(search ? { OR: [{ id: { contains: search } }, { user: { name: { contains: search } } }, { user: { email: { contains: search } } }, { event: { title: { contains: search } } }] } : {}),
  };
  const [total, bookings] = await prisma.$transaction([
    prisma.booking.count({ where }),
    prisma.booking.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * limit, take: limit,
      select: { id: true, status: true, totalAmount: true, currency: true, createdAt: true,
        user: { select: { id: true, name: true, email: true } }, event: { select: { id: true, title: true, city: true } },
        payment: { select: { status: true, amount: true, currency: true } }, _count: { select: { items: true } } } }),
  ]);
  return { bookings, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
}

export async function listAdminUsers(page: number, limit: number, search?: string, role?: "CUSTOMER" | "ORGANIZER" | "ADMIN") {
  const where: Prisma.UserWhereInput = {
    ...(role ? { role } : {}),
    ...(search ? { OR: [{ name: { contains: search } }, { email: { contains: search } }] } : {}),
  };
  const [total, users] = await prisma.$transaction([
    prisma.user.count({ where }),
    prisma.user.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * limit, take: limit,
      select: { id: true, name: true, email: true, role: true, organizerApproved: true, createdAt: true, _count: { select: { bookings: true, events: true } } } }),
  ]);
  return { users, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
}

export async function getAdminEventById(id: string) {
  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      ticketTypes: true,
      organizer: { select: { id: true, name: true, email: true } },
      _count: { select: { bookings: true } },
    },
  });
  if (!event) throw new Error("Event not found.");
  return event;
}

export async function createAdminEvent(
  adminUserId: string,
  input: {
    title: string;
    description: string;
    category: string;
    city: string;
    venue: string;
    imageUrl?: string;
    startAt: string;
    endAt: string;
    ticketTypes: Array<{ name: string; price: number; capacity: number }>;
    status?: "DRAFT" | "PUBLISHED";
    featured?: boolean;
  },
) {
  return prisma.event.create({
    data: {
      organizerId: adminUserId,
      title: input.title,
      description: input.description,
      category: input.category,
      city: input.city,
      venue: input.venue,
      imageUrl: input.imageUrl,
      startAt: new Date(input.startAt),
      endAt: new Date(input.endAt),
      status: (input.status as "DRAFT" | "PUBLISHED") ?? "PUBLISHED",
      featured: input.featured ?? false,
      ticketTypes: {
        create: input.ticketTypes.map((ticketType) => ({
          name: ticketType.name,
          capacity: ticketType.capacity,
          price: new Prisma.Decimal(ticketType.price),
        })),
      },
    },
    include: { ticketTypes: true },
  });
}

export async function updateAdminEvent(
  id: string,
  input: Record<string, unknown>,
) {
  const data: Prisma.EventUpdateInput = {};
  if (typeof input.title === "string") data.title = input.title;
  if (typeof input.description === "string") data.description = input.description;
  if (typeof input.category === "string") data.category = input.category;
  if (typeof input.city === "string") data.city = input.city;
  if (typeof input.venue === "string") data.venue = input.venue;
  if (typeof input.imageUrl === "string" || input.imageUrl === null)
    data.imageUrl = input.imageUrl as string | null;
  if (typeof input.startAt === "string") data.startAt = new Date(input.startAt);
  if (typeof input.endAt === "string") data.endAt = new Date(input.endAt);
  if (
    typeof input.status === "string" &&
    ["DRAFT", "PUBLISHED", "CANCELLED"].includes(input.status)
  ) {
    data.status = input.status as "DRAFT" | "PUBLISHED" | "CANCELLED";
  }
  if (typeof input.featured === "boolean") data.featured = input.featured;
  return prisma.event.update({
    where: { id },
    data,
    include: { ticketTypes: true },
  });
}

export async function deleteAdminEvent(id: string) {
  const bookingsCount = await prisma.booking.count({ where: { eventId: id } });
  if (bookingsCount > 0) {
    return prisma.event.update({
      where: { id },
      data: { status: "CANCELLED" },
    });
  }
  return prisma.event.delete({ where: { id } });
}

export async function listCategories() {
  const [events, movies] = await prisma.$transaction([
    prisma.event.groupBy({ by: ["category"], orderBy: { category: "asc" }, _count: { category: true } }),
    prisma.movie.groupBy({ by: ["genre"], orderBy: { genre: "asc" }, _count: { genre: true } }),
  ]);
  const categories = new Map<string, { name: string; events: number; movies: number }>();
  for (const item of events) categories.set(item.category, { name: item.category, events: typeof item._count === "object" && item._count ? item._count.category ?? 0 : 0, movies: 0 });
  for (const item of movies) {
    const value = categories.get(item.genre) ?? { name: item.genre, events: 0, movies: 0 };
    value.movies = typeof item._count === "object" && item._count ? item._count.genre ?? 0 : 0;
    categories.set(item.genre, value);
  }
  return [...categories.values()].sort((a, b) => a.name.localeCompare(b.name));
}
