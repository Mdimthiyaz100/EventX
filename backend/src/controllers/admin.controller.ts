import type { RequestHandler } from "express";
import * as adminService from "../services/admin.service.js";
import * as eventService from "../services/event.service.js";
import { routeParam, sendData } from "../utils/http.js";
import { transactionQuerySchema } from "../validators/admin.validator.js";

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
  sendData(response, result.payments, 200, result.pagination);
};