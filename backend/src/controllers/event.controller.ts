import type { RequestHandler } from "express";
import * as eventService from "../services/event.service.js";
import { AppError, routeParam, sendData } from "../utils/http.js";
import { eventListQuerySchema } from "../validators/event.validator.js";

export const list: RequestHandler = async (request, response) => {
  const filters = eventListQuerySchema.parse(request.query);
  const result = await eventService.listPublished(filters);
  sendData(
    response,
    result.events.map((event) => {
      const { city, startAt, ticketTypes, ...rest } = event;
      const availablePrices = ticketTypes
        .filter((ticketType) => ticketType.sold < ticketType.capacity)
        .map((ticketType) => Number(ticketType.price));
      return {
        ...rest,
        location: city,
        startDate: startAt,
        price: availablePrices.length ? Math.min(...availablePrices) : 0,
        imageUrl: event.imageUrl ?? "",
      };
    }),
    200,
    result.pagination,
  );
};

export const getById: RequestHandler = async (request, response) => {
  const event = await eventService.getPublishedById(routeParam(request.params.id, "id"));
  sendData(response, { ...event, location: event.city, startDate: event.startAt });
};

export const create: RequestHandler = async (request, response) => {
  const event = await eventService.createEvent(request.auth!.userId, request.body);
  sendData(response, event, 201);
};

export const organizerList: RequestHandler = async (request, response) => {
  const result = await eventService.listOrganizerEvents(
    request.auth!.userId,
    Number(request.query.page ?? 1),
    Number(request.query.limit ?? 12),
  );
  sendData(response, result.events, 200, result.pagination);
};

export const update: RequestHandler = async (request, response) => {
  sendData(
    response,
    await eventService.updateOrganizerEvent(
      request.auth!.userId,
      routeParam(request.params.id, "id"),
      request.body,
    ),
  );
};

export const uploadImage: RequestHandler = async (request, response) => {
  if (!request.file) {
    throw new AppError(400, "IMAGE_REQUIRED", "Upload an image in the image field.");
  }
  const result = await eventService.storeEventImage(request.auth!.userId, request.file);
  sendData(response, result, 201);
};

export const pending: RequestHandler = async (request, response) => {
  const result = await eventService.listPendingEvents(
    Number(request.query.page ?? 1),
    Number(request.query.limit ?? 12),
  );
  sendData(response, result.events, 200, result.pagination);
};

export const review: RequestHandler = async (request, response) => {
  sendData(
    response,
    await eventService.reviewEvent(routeParam(request.params.id, "id"), request.body.publish),
  );
};