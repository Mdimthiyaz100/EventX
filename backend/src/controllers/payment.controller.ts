import type { RequestHandler } from "express";
import * as paymentService from "../services/payment.service.js";
import { AppError, sendData } from "../utils/http.js";

export const createPaymentLink: RequestHandler = async (request, response) => {
  sendData(
    response,
    await paymentService.createPaymentLink(request.auth!.userId, request.body.bookingId),
    201,
  );
};

export const webhook: RequestHandler = async (request, response) => {
  const signature = request.header("x-razorpay-signature");
  const eventId = request.header("x-razorpay-event-id");
  const rawBody = request.body;
  if (
    !signature ||
    !eventId ||
    eventId.length > 191 ||
    !Buffer.isBuffer(rawBody)
  ) {
    throw new AppError(400, "INVALID_WEBHOOK", "Webhook signature, event ID, and raw body are required.");
  }
  if (!paymentService.verifyWebhookSignature(rawBody, signature)) {
    throw new AppError(401, "INVALID_WEBHOOK_SIGNATURE", "Webhook signature verification failed.");
  }
  let payload: unknown;
  try {
    payload = JSON.parse(rawBody.toString("utf8"));
  } catch {
    throw new AppError(400, "INVALID_WEBHOOK", "Webhook body is not valid JSON.");
  }
  const result = await paymentService.processWebhook(eventId, payload);
  sendData(response, result);
};