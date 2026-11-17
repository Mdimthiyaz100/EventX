import type { RequestHandler } from "express";
import * as adminService from "../services/admin.service.js";
import * as eventService from "../services/event.service.js";
import { routeParam, sendData } from "../utils/http.js";
import { adminListQuerySchema, transactionQuerySchema } from "../validators/admin.validator.js";

export const dashboard: RequestHandler = async (_request, response) => {
  sendData(response, await adminService.getDashboard());
};

export const pendingEvents: RequestHandler = async (request, response) => {
  const page = Math.max(1, Number(request.query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(request.query.limit) || 20));
  const result = await eventService.listPendingEvents(page, limit);
  sendData(response, result.events, 200, result.pagination);
};

export const reviewEvent: RequestHandler = async (request, response) => {
  sendData(
    response,
    await eventService.reviewEvent(
      routeParam(request.params.id, "id"),
      request.body.publish,
    ),
  );
};

export const transactions: RequestHandler = async (request, response) => {
  const { page, limit, status } = transactionQuerySchema.parse(request.query);
  const result = await adminService.listTransactions(page, limit, status);
  sendData(response, result);
};

export const events: RequestHandler = async (request, response) => {
  const query = adminListQuerySchema.parse(request.query);
  sendData(response, await adminService.listAdminEvents(query.page, query.limit, query.search, query.status, query.category));
};

export const bookings: RequestHandler = async (request, response) => {
  const query = adminListQuerySchema.parse(request.query);
  sendData(response, await adminService.listAdminBookings(query.page, query.limit, query.search, query.status));
};

export const users: RequestHandler = async (request, response) => {
  const query = adminListQuerySchema.parse(request.query);
  sendData(response, await adminService.listAdminUsers(query.page, query.limit, query.search, query.role));
};

export const categories: RequestHandler = async (_request, response) => {
  sendData(response, await adminService.listCategories());
};

export const getEvent: RequestHandler = async (request, response) => {
  sendData(response, await adminService.getAdminEventById(routeParam(request.params.id, "id")));
};

export const createEvent: RequestHandler = async (request, response) => {
  const adminId = request.auth?.userId;
  if (!adminId) throw new Error("Admin authentication required.");
  sendData(response, await adminService.createAdminEvent(adminId, request.body), 201);
};

export const updateEvent: RequestHandler = async (request, response) => {
  sendData(response, await adminService.updateAdminEvent(routeParam(request.params.id, "id"), request.body));
};

export const deleteEvent: RequestHandler = async (request, response) => {
  sendData(response, await adminService.deleteAdminEvent(routeParam(request.params.id, "id")));
};
