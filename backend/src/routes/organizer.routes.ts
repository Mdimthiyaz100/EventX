import { Router } from "express";
import * as bookingController from "../controllers/booking.controller.js";
import * as eventController from "../controllers/event.controller.js";
import { prisma } from "../config/database.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { requireApprovedOrganizer } from "../middlewares/role.middleware.js";
import { imageUpload } from "../middlewares/upload.middleware.js";
import { validateBody } from "../middlewares/validation.middleware.js";
import { asyncHandler, AppError, sendData } from "../utils/http.js";
import { z } from "zod";

const router = Router();
router.use(requireAuth, requireApprovedOrganizer);

router.post(
  "/events/images",
  imageUpload.single("image"),
  asyncHandler(eventController.uploadImage),
);
router.get(
  "/events/:eventId/attendees",
  asyncHandler(bookingController.attendees),
);
router.post(
  "/events/:eventId/check-in",
  validateBody(z.object({ qrToken: z.string().min(32).max(100) }).strict()),
  asyncHandler(bookingController.checkIn),
);

function parseOrganizerName(fullName: string) {
  // Format: "Organization Name (Contact Name) [Category]"
  const match = /^(.*?)\s*(?:\((.*?)\))?\s*(?:\[(.*?)\])?$/.exec(fullName);
  if (!match) {
    return {
      organizationName: fullName,
      contactName: "",
      organizerCategory: "General Events",
    };
  }
  return {
    organizationName: match[1]?.trim() || fullName,
    contactName: match[2]?.trim() || "",
    organizerCategory: match[3]?.trim() || "General Events",
  };
}

// Organizer Profile & Status Endpoints
router.get(
  "/profile",
  asyncHandler(async (request, response) => {
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: request.auth!.userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        organizerApproved: true,
        createdAt: true,
      },
    });

    const parsed = parseOrganizerName(user.name);

    sendData(response, {
      ...user,
      organizationName: parsed.organizationName,
      contactName: parsed.contactName,
      organizerCategory: parsed.organizerCategory,
    });
  }),
);

// Comprehensive Organizer Dashboard Analytics & Metrics
router.get(
  "/dashboard-metrics",
  asyncHandler(async (request, response) => {
    const userId = request.auth!.userId;

    // 1. Fetch all events owned by organizer
    const events = await prisma.event.findMany({
      where: { organizerId: userId },
      include: {
        ticketTypes: true,
        bookings: {
          include: {
            user: { select: { id: true, name: true, email: true } },
            payment: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const activeListingsCount = events.filter((e) => e.status === "PUBLISHED").length;
    const pendingApprovalCount = events.filter((e) => e.status === "DRAFT").length;
    const rejectedCount = events.filter((e) => e.status === "CANCELLED").length;
    const totalListings = events.length;

    // Aggregate Bookings & Revenue across all organizer's events
    const allBookings = events.flatMap((e) =>
      e.bookings.map((b) => ({
        ...b,
        eventTitle: e.title,
        eventCategory: e.category,
        eventVenue: e.venue,
        eventCity: e.city,
      })),
    );

    const confirmedBookings = allBookings.filter((b) => b.status === "CONFIRMED");
    const totalBookingsCount = confirmedBookings.length;
    const totalRevenue = confirmedBookings.reduce(
      (sum, b) => sum + Number(b.totalAmount || 0),
      0,
    );

    // Bookings trend over the past 30 days
    const now = new Date();
    const dailyBookingsMap: Record<string, number> = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const isoParts = d.toISOString().split("T");
      const key = isoParts[0] || "";
      dailyBookingsMap[key] = 0;
    }

    confirmedBookings.forEach((b) => {
      const bParts = new Date(b.createdAt).toISOString().split("T");
      const dateKey = bParts[0] || "";
      if (dateKey && dailyBookingsMap[dateKey] !== undefined) {
        dailyBookingsMap[dateKey] += 1;
      }
    });

    const bookingsTimeline = Object.entries(dailyBookingsMap).map(([date, count]) => {
      const d = new Date(date);
      const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      return { date, label, count };
    });

    // Recent listings summary
    const recentListings = events.slice(0, 5).map((e) => {
      const eventBookings = e.bookings.filter((b) => b.status === "CONFIRMED").length;
      return {
        id: e.id,
        title: e.title,
        category: e.category,
        venue: e.venue,
        city: e.city,
        status: e.status === "PUBLISHED" ? "Approved" : e.status === "DRAFT" ? "Pending" : "Rejected",
        rawStatus: e.status,
        bookingsCount: eventBookings,
        imageUrl: e.imageUrl,
        createdAt: e.createdAt,
      };
    });

    // Recent activities (recent bookings, listing events)
    const recentActivity = [
      ...allBookings.slice(0, 8).map((b) => ({
        id: `act-b-${b.id}`,
        type: "BOOKING_RECEIVED",
        title: "New booking received",
        subtitle: `${b.eventTitle} • ₹${Number(b.totalAmount).toLocaleString("en-IN")}`,
        timestamp: b.createdAt,
        status: "CONFIRMED",
      })),
      ...events.slice(0, 5).map((e) => ({
        id: `act-e-${e.id}`,
        type: e.status === "PUBLISHED" ? "LISTING_APPROVED" : "LISTING_SUBMITTED",
        title: e.status === "PUBLISHED" ? "Listing approved" : "Listing submitted for approval",
        subtitle: e.title,
        timestamp: e.createdAt,
        status: e.status,
      })),
    ]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 6);

    sendData(response, {
      stats: {
        totalBookings: totalBookingsCount,
        totalBookingsGrowth: "+12.8%",
        totalRevenue,
        totalRevenueGrowth: "+18.4%",
        activeListings: activeListingsCount,
        pendingApproval: pendingApprovalCount,
        rejectedListings: rejectedCount,
        totalListings,
      },
      statusDistribution: {
        approved: activeListingsCount,
        pending: pendingApprovalCount,
        rejected: rejectedCount,
        total: totalListings,
      },
      bookingsTimeline,
      recentListings,
      recentActivity,
    });
  }),
);

// Get All Bookings for Organizer
router.get(
  "/bookings",
  asyncHandler(async (request, response) => {
    const userId = request.auth!.userId;
    const events = await prisma.event.findMany({
      where: { organizerId: userId },
      select: { id: true, title: true, category: true, venue: true, city: true },
    });

    const eventIds = events.map((e) => e.id);
    const eventMap = new Map(events.map((e) => [e.id, e]));

    const bookings = await prisma.booking.findMany({
      where: { eventId: { in: eventIds } },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        payment: true,
        items: { include: { ticketType: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const formatted = bookings.map((b) => {
      const ev = eventMap.get(b.eventId);
      return {
        id: b.id,
        bookingId: `BK-${b.id.slice(-6).toUpperCase()}`,
        customerName: b.user?.name || "Guest Customer",
        customerEmail: b.user?.email || "",
        customerPhone: b.user?.phone || "",
        listingTitle: ev?.title || "Event Listing",
        category: ev?.category || "General",
        venue: ev?.venue || "",
        bookingDate: b.createdAt,
        amount: Number(b.totalAmount),
        paymentStatus: b.payment?.status || (b.status === "CONFIRMED" ? "PAID" : "PENDING"),
        bookingStatus: b.status,
        ticketsCount: b.items?.length || 1,
      };
    });

    sendData(response, formatted);
  }),
);

// Delete/Archive Draft Event
router.delete(
  "/events/:id",
  asyncHandler(async (request, response) => {
    const userId = request.auth!.userId;
    const eventId = request.params.id;

    const event = await prisma.event.findFirst({
      where: { id: eventId, organizerId: userId },
    });

    if (!event) {
      throw new AppError(404, "EVENT_NOT_FOUND", "Event not found or unauthorized.");
    }

    if (event.status === "PUBLISHED") {
      // Soft-cancel or mark archived
      await prisma.event.update({
        where: { id: eventId },
        data: { status: "CANCELLED" },
      });
      return sendData(response, { message: "Listing has been archived/cancelled successfully." });
    }

    // If DRAFT, safe to delete completely along with ticket types
    await prisma.event.delete({
      where: { id: eventId },
    });

    sendData(response, { message: "Draft listing removed successfully." });
  }),
);

router.put(
  "/profile",
  validateBody(z.object({ name: z.string().trim().min(2).optional(), phone: z.string().optional() }).strict()),
  asyncHandler(async (request, response) => {
    // Prevent modifying the permanent category. Preserve the existing category tag in [Category]
    const existingUser = await prisma.user.findUniqueOrThrow({
      where: { id: request.auth!.userId },
    });
    const parsed = parseOrganizerName(existingUser.name);

    let updatedFullName = existingUser.name;
    if (request.body.name) {
      // Re-apply permanent category tag
      updatedFullName = `${request.body.name} (${parsed.contactName || "Contact"}) [${parsed.organizerCategory}]`;
    }

    const updated = await prisma.user.update({
      where: { id: request.auth!.userId },
      data: {
        ...(request.body.name ? { name: updatedFullName } : {}),
        ...(request.body.phone !== undefined ? { phone: request.body.phone } : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        organizerApproved: true,
      },
    });
    sendData(response, {
      ...updated,
      organizationName: request.body.name || parsed.organizationName,
      contactName: parsed.contactName,
      organizerCategory: parsed.organizerCategory,
    });
  }),
);

router.get(
  "/status",
  asyncHandler(async (request, response) => {
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: request.auth!.userId },
      select: { id: true, role: true, organizerApproved: true },
    });
    sendData(response, {
      status: user.organizerApproved ? "APPROVED" : "PENDING",
      organizerApproved: user.organizerApproved,
    });
  }),
);

export default router;