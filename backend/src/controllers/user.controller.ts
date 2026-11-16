import type { RequestHandler } from "express";
import * as userService from "../services/user.service.js";
import { routeParam, sendData } from "../utils/http.js";

export const listOrganizers: RequestHandler = async (request, response) => {
  const page = Math.max(1, Number(request.query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(request.query.limit) || 20));
  const result = await userService.listOrganizers(page, limit);
  sendData(response, result.organizers, 200, result.pagination);
};

export const approveOrganizer: RequestHandler = async (request, response) => {
  sendData(
    response,
    await userService.setOrganizerApproval(
      routeParam(request.params.id, "id"),
      request.body.approved,
    ),
  );
};