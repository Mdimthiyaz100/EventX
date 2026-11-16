import type { RequestHandler } from "express";
import * as ticketService from "../services/ticket.service.js";
import * as bookingService from "../services/booking.service.js";
import { AppError, routeParam, sendData } from "../utils/http.js";

export const create: RequestHandler = async (request, response) => {
  const idempotencyKey = request.header("idempotency-key");
  if (!idempotencyKey || idempotencyKey.length > 100) {
    throw new AppError(400, "IDEMPOTENCY_KEY_REQUIRED", "Provide a valid Idempotency-Key header.");
  }
  const booking = await bookingService.createBooking(
    request.auth!.userId,
    request.body,
    idempotencyKey,
  );
  sendData(response, booking, 201);
};

export const listMine: RequestHandler = async (request, response) => {
  const page = Math.max(1, Number(request.query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(request.query.limit) || 12));
  const result = await bookingService.listUserBookings(request.auth!.userId, page, limit);
  sendData(response, result.bookings, 200, result.pagination);
};

export const cancel: RequestHandler = async (request, response) => {
  sendData(
    response,
    await bookingService.cancelPendingBooking(
      request.auth!.userId,
      routeParam(request.params.id, "id"),
    ),
  );
};

export const attendees: RequestHandler = async (request, response) => {
  const page = Math.max(1, Number(request.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(request.query.limit) || 50));
  const result = await bookingService.listEventAttendees(
    request.auth!.userId,
    routeParam(request.params.eventId, "eventId"),
    page,
    limit,
  );
  sendData(response, result.tickets, 200, result.pagination);
};

export const checkIn: RequestHandler = async (request, response) => {
  sendData(
    response,
    await ticketService.checkIn(
      request.auth!.userId,
      routeParam(request.params.eventId, "eventId"),
      request.body.qrToken,
    ),
  );
};