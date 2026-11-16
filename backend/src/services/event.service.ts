import { EventStatus, Prisma, UserRole } from "@prisma/client";
import { prisma } from "../config/database.js";
import { env } from "../config/env.js";
import { AppError } from "../utils/http.js";

interface EventFilters {
  page: number;
  limit: number;
  search?: string;
  city?: string;
  category?: string;
  dateFrom?: string;
  dateTo?: string;
  featured?: "true" | "false";
}

function assertDateRange(from?: string, to?: string): void {
  if (from && to && new Date(from) > new Date(to)) {
    throw new AppError(400, "INVALID_DATE_RANGE", "dateFrom must be before dateTo.");
  }
}

export async function listPublished(filters: EventFilters) {
  assertDateRange(filters.dateFrom, filters.dateTo);
  const where: Prisma.EventWhereInput = {
    status: EventStatus.PUBLISHED,
    ...(filters.featured ? { featured: filters.featured === "true" } : {}),
    ...(filters.city ? { city: { equals: filters.city } } : {}),
    ...(filters.category
      ? { category: { equals: filters.category } }
      : {}),
    ...(filters.search
      ? {
          OR: [
            { title: { contains: filters.search } },
            { description: { contains: filters.search } },
            { venue: { contains: filters.search } },
          ],
        }
      : {}),
    ...(filters.dateFrom || filters.dateTo
      ? {
          startAt: {
            ...(filters.dateFrom ? { gte: new Date(filters.dateFrom) } : {}),
            ...(filters.dateTo ? { lte: new Date(filters.dateTo) } : {}),
          },
        }
      : {}),
  };

  const [total, events] = await prisma.$transaction([
    prisma.event.count({ where }),
    prisma.event.findMany({
      where,
      orderBy: [{ featured: "desc" }, { startAt: "asc" }],
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit,
      include: {
        ticketTypes: { select: { id: true, name: true, price: true, capacity: true, sold: true } },
      },
    }),
  ]);
  return {
    events,
    pagination: {
      page: filters.page,
      limit: filters.limit,
      total,
      pages: Math.ceil(total / filters.limit),
    },
  };
}

export async function getPublishedById(id: string) {
  const event = await prisma.event.findFirst({
    where: { id, status: EventStatus.PUBLISHED },
    include: {
      ticketTypes: {
        select: { id: true, name: true, price: true, capacity: true, sold: true },
      },
      organizer: { select: { id: true, name: true } },
    },
  });
  if (!event) throw new AppError(404, "EVENT_NOT_FOUND", "Event not found.");
  return event;
}

async function assertApprovedOrganizer(userId: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, organizerApproved: true },
  });
  if (user?.role !== UserRole.ORGANIZER || !user.organizerApproved) {
    throw new AppError(403, "ORGANIZER_NOT_APPROVED", "An approved organizer account is required.");
  }
}

export async function createEvent(userId: string, input: {
  title: string;
  description: string;
  category: string;
  city: string;
  venue: string;
  imageUrl?: string;
  startAt: string;
  endAt: string;
  ticketTypes: Array<{ name: string; price: number; capacity: number }>;
}) {
  await assertApprovedOrganizer(userId);
  return prisma.event.create({
    data: {
      organizerId: userId,
      title: input.title,
      description: input.description,
      category: input.category,
      city: input.city,
      venue: input.venue,
      imageUrl: input.imageUrl,
      startAt: new Date(input.startAt),
      endAt: new Date(input.endAt),
      ticketTypes: {
        create: input.ticketTypes.map((ticketType) => ({
          ...ticketType,
          price: new Prisma.Decimal(ticketType.price),
        })),
      },
    },
    include: { ticketTypes: true },
  });
}

export async function listOrganizerEvents(userId: string, page: number, limit: number) {
  const [total, events] = await prisma.$transaction([
    prisma.event.count({ where: { organizerId: userId } }),
    prisma.event.findMany({
      where: { organizerId: userId },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: { ticketTypes: true },
    }),
  ]);
  return { events, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
}

export async function updateOrganizerEvent(
  userId: string,
  eventId: string,
  input: Record<string, unknown>,
) {
  await assertApprovedOrganizer(userId);
  const event = await prisma.event.findFirst({
    where: { id: eventId, organizerId: userId },
  });
  if (!event) throw new AppError(404, "EVENT_NOT_FOUND", "Event not found.");
  if (event.status !== EventStatus.DRAFT) {
    throw new AppError(409, "EVENT_LOCKED", "Only draft events can be edited.");
  }
  const startAt =
    typeof input.startAt === "string" ? new Date(input.startAt) : event.startAt;
  const endAt =
    typeof input.endAt === "string" ? new Date(input.endAt) : event.endAt;
  if (endAt <= startAt) {
    throw new AppError(400, "INVALID_EVENT_DATES", "Event end must be after its start.");
  }

  const data: Prisma.EventUpdateInput = {};
  if (typeof input.title === "string") data.title = input.title;
  if (typeof input.description === "string") data.description = input.description;
  if (typeof input.category === "string") data.category = input.category;
  if (typeof input.city === "string") data.city = input.city;
  if (typeof input.venue === "string") data.venue = input.venue;
  if (typeof input.imageUrl === "string") data.imageUrl = input.imageUrl;
  if (typeof input.startAt === "string") data.startAt = startAt;
  if (typeof input.endAt === "string") data.endAt = endAt;
  return prisma.event.update({
    where: { id: eventId },
    data,
    include: { ticketTypes: true },
  });
}

export async function storeEventImage(userId: string, file: Express.Multer.File) {
  await assertApprovedOrganizer(userId);
  const { fileTypeFromBuffer } = await import("file-type");
  const detected = await fileTypeFromBuffer(file.buffer);
  const extensionByMime: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  };
  if (!detected || !extensionByMime[detected.mime]) {
    throw new AppError(415, "UNSUPPORTED_IMAGE", "Only JPEG, PNG, and WebP images are accepted.");
  }

  const { mkdir, writeFile } = await import("node:fs/promises");
  const { resolve } = await import("node:path");
  const { randomUUID } = await import("node:crypto");
  const directory = resolve(process.cwd(), env.UPLOAD_DIR);
  await mkdir(directory, { recursive: true });
  const filename = `${randomUUID()}.${extensionByMime[detected.mime]}`;
  await writeFile(resolve(directory, filename), file.buffer, { flag: "wx" });
  return { url: `/uploads/${filename}` };
}

export async function reviewEvent(eventId: string, publish: boolean) {
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) throw new AppError(404, "EVENT_NOT_FOUND", "Event not found.");
  if (event.status === EventStatus.CANCELLED) {
    throw new AppError(409, "EVENT_CANCELLED", "A cancelled event cannot be published.");
  }
  return prisma.event.update({
    where: { id: eventId },
    data: { status: publish ? EventStatus.PUBLISHED : EventStatus.DRAFT },
  });
}

export async function listPendingEvents(page: number, limit: number) {
  const where = { status: EventStatus.DRAFT };
  const [total, events] = await prisma.$transaction([
    prisma.event.count({ where }),
    prisma.event.findMany({
      where,
      orderBy: { createdAt: "asc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        organizer: { select: { id: true, name: true, email: true } },
        ticketTypes: true,
      },
    }),
  ]);
  return { events, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
}