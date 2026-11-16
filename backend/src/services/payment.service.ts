import { createHmac, timingSafeEqual, randomBytes } from "node:crypto";
import {
  BookingStatus,
  PaymentStatus,
} from "@prisma/client";
import { env } from "../config/env.js";
import { prisma } from "../config/database.js";
import { getRazorpayClient } from "../config/razorpay.js";
import { AppError } from "../utils/http.js";
import { z } from "zod";

export async function createPaymentLink(userId: string, bookingId: string) {
  const booking = await prisma.booking.findFirst({
    where: {
      id: bookingId,
      userId,
      status: BookingStatus.PENDING,
      expiresAt: { gt: new Date() },
    },
    include: {
      payment: true,
      user: { select: { name: true, email: true, phone: true } },
    },
  });
  if (!booking?.payment) {
    throw new AppError(404, "BOOKING_NOT_PAYABLE", "A pending booking was not found.");
  }
  if (booking.payment.providerReferenceId && booking.payment.checkoutUrl) {
    return {
      paymentLinkId: booking.payment.providerReferenceId,
      shortUrl: booking.payment.checkoutUrl,
      paymentId: booking.payment.id,
      amount: booking.payment.amount,
      currency: booking.payment.currency,
    };
  }
  if (!booking.user.phone) {
    throw new AppError(400, "PHONE_REQUIRED", "Add a phone number to your profile before payment.");
  }

  const amount = booking.payment.amount.mul(100).toDecimalPlaces(0).toNumber();
  const expiresAt = booking.expiresAt;
  if (!expiresAt || expiresAt <= new Date()) {
    throw new AppError(409, "BOOKING_EXPIRED", "This booking has expired.");
  }
  const paymentLink = await getRazorpayClient().paymentLink.create({
    amount,
    currency: booking.payment.currency,
    accept_partial: false,
    expire_by: Math.floor(expiresAt.getTime() / 1000),
    reference_id: booking.payment.id,
    description: `EventX booking ${booking.id}`,
    customer: {
      name: booking.user.name,
      email: booking.user.email,
      contact: booking.user.phone,
    },
    notify: { email: false, sms: false },
    reminder_enable: false,
    notes: { bookingId: booking.id },
  });
  const linked = await prisma.payment.updateMany({
    where: {
      id: booking.payment.id,
      status: PaymentStatus.PENDING,
      providerReferenceId: null,
      booking: {
        is: {
          status: BookingStatus.PENDING,
          expiresAt: { gt: new Date() },
        },
      },
    },
    data: {
      providerReferenceId: paymentLink.id,
      checkoutUrl: paymentLink.short_url,
    },
  });
  if (linked.count !== 1) {
    const currentPayment = await prisma.payment.findUnique({
      where: { id: booking.payment.id },
    });
    if (currentPayment?.providerReferenceId && currentPayment.checkoutUrl) {
      return {
        paymentLinkId: currentPayment.providerReferenceId,
        shortUrl: currentPayment.checkoutUrl,
        paymentId: currentPayment.id,
        amount: currentPayment.amount,
        currency: currentPayment.currency,
      };
    }
    throw new AppError(409, "BOOKING_NOT_PAYABLE", "The booking changed while creating the payment order.");
  }
  return {
    paymentLinkId: paymentLink.id,
    shortUrl: paymentLink.short_url,
    paymentId: booking.payment.id,
    amount: paymentLink.amount,
    currency: paymentLink.currency,
  };
}

export function verifyWebhookSignature(rawBody: Buffer, signature: string): boolean {
  if (!env.PAYMENT_WEBHOOK_SECRET) {
    throw new AppError(
      503,
      "PAYMENTS_NOT_CONFIGURED",
      "Payment webhook verification is not configured.",
    );
  }
  const expected = createHmac("sha256", env.PAYMENT_WEBHOOK_SECRET)
    .update(rawBody)
    .digest();
  let actual: Buffer;
  try {
    actual = Buffer.from(signature, "hex");
  } catch {
    return false;
  }
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

async function processTerminalLinkWebhook(
  eventId: string,
  payload: unknown,
  status: "expired" | "cancelled",
): Promise<{ processed: boolean }> {
  const parsed = z
    .object({
      payload: z.object({
        payment_link: z.object({
          entity: z.object({
            id: z.string().min(1),
            status: z.literal(status),
          }).passthrough(),
        }).passthrough(),
      }).passthrough(),
    })
    .passthrough()
    .safeParse(payload);
  if (!parsed.success) {
    throw new AppError(400, "INVALID_WEBHOOK", "Payment-link webhook payload is incomplete.");
  }

  try {
    await prisma.$transaction(async (transaction) => {
      await transaction.webhookEvent.create({ data: { id: eventId } });
      const payment = await transaction.payment.findUnique({
        where: { providerReferenceId: parsed.data.payload.payment_link.entity.id },
        include: { booking: { include: { items: true } } },
      });
      if (!payment) {
        throw new AppError(404, "PAYMENT_NOT_FOUND", "Payment link was not found.");
      }
      if (
        payment.status !== PaymentStatus.PENDING ||
        payment.booking.status !== BookingStatus.PENDING
      ) {
        return;
      }

      const settled = await transaction.payment.updateMany({
        where: { id: payment.id, status: PaymentStatus.PENDING },
        data: { status: PaymentStatus.FAILED },
      });
      const expired = await transaction.booking.updateMany({
        where: { id: payment.bookingId, status: BookingStatus.PENDING },
        data: { status: BookingStatus.EXPIRED },
      });
      if (settled.count !== 1 || expired.count !== 1) {
        throw new AppError(409, "PAYMENT_STATE_CHANGED", "Booking payment state changed.");
      }
      for (const item of payment.booking.items) {
        const released = await transaction.ticketType.updateMany({
          where: { id: item.ticketTypeId, sold: { gte: item.quantity } },
          data: { sold: { decrement: item.quantity } },
        });
        if (released.count !== 1) {
          throw new Error(`Ticket reservation inventory mismatch for booking ${payment.bookingId}.`);
        }
      }
    });
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "P2002") {
      const duplicate = await prisma.webhookEvent.findUnique({ where: { id: eventId } });
      if (duplicate) return { processed: false };
    }
    throw error;
  }
  return { processed: true };
}

export async function processWebhook(
  eventId: string,
  payload: unknown,
): Promise<{ processed: boolean }> {
  const eventName =
    typeof payload === "object" && payload !== null && "event" in payload
      ? payload.event
      : undefined;
  if (eventName === "payment_link.expired" || eventName === "payment_link.cancelled") {
    return processTerminalLinkWebhook(
      eventId,
      payload,
      eventName === "payment_link.expired" ? "expired" : "cancelled",
    );
  }
  if (eventName !== "payment_link.paid") {
    return { processed: false };
  }
  const parsed = z
    .object({
      event: z.literal("payment_link.paid"),
      payload: z
        .object({
          payment_link: z
            .object({
              entity: z.object({
                id: z.string().min(1),
                reference_id: z.string().min(1),
                amount: z.number().int().positive(),
                amount_paid: z.number().int().positive(),
                currency: z.string().length(3),
                status: z.literal("paid"),
              }).passthrough(),
            })
            .passthrough(),
          payment: z
            .object({
              entity: z.object({
                id: z.string().min(1),
                amount: z.number().int().positive(),
                currency: z.string().length(3),
                status: z.literal("captured"),
              }).passthrough(),
            })
            .passthrough(),
        })
        .passthrough(),
    })
    .passthrough()
    .safeParse(payload);
  if (!parsed.success) {
    throw new AppError(400, "INVALID_WEBHOOK", "Payment webhook payload is incomplete.");
  }
  const { payment_link: link, payment: paidPayment } = parsed.data.payload;
  const paymentLinkId = z.string().parse(link.id);
  const paymentReferenceId = z.string().parse(link.reference_id);
  const providerPaymentId = z.string().parse(paidPayment.entity.id);
  if (
    link.currency !== "INR" ||
    paidPayment.entity.currency !== "INR" ||
    link.amount !== link.amount_paid ||
    paidPayment.entity.amount !== link.amount_paid
  ) {
    throw new AppError(400, "INVALID_WEBHOOK", "Payment webhook payload is incomplete.");
  }

  try {
    await prisma.$transaction(async (transaction) => {
      await transaction.webhookEvent.create({ data: { id: eventId } });
      const storedPayment = await transaction.payment.findUnique({
        where: { providerReferenceId: paymentLinkId },
        include: { booking: { include: { items: true } } },
      });
      if (!storedPayment) {
        throw new AppError(404, "PAYMENT_NOT_FOUND", "Payment link was not found.");
      }

      const expectedPaise = storedPayment.amount.mul(100).toDecimalPlaces(0).toNumber();
      if (
        paymentReferenceId !== storedPayment.id ||
        link.amount_paid !== expectedPaise ||
        paidPayment.entity.amount !== expectedPaise ||
        storedPayment.currency !== link.currency
      ) {
        throw new AppError(400, "PAYMENT_AMOUNT_MISMATCH", "Payment amount does not match the booking.");
      }
      if (storedPayment.status === PaymentStatus.PAID) {
        if (storedPayment.providerPaymentId === providerPaymentId) return;
        throw new AppError(409, "PAYMENT_ALREADY_SETTLED", "A different payment has already settled this booking.");
      }
      if (
        storedPayment.status !== PaymentStatus.PENDING ||
        storedPayment.booking.status !== BookingStatus.PENDING
      ) {
        throw new AppError(409, "PAYMENT_NOT_PENDING", "This booking can no longer be paid.");
      }

      const settled = await transaction.payment.updateMany({
        where: { id: storedPayment.id, status: PaymentStatus.PENDING },
        data: { status: PaymentStatus.PAID, providerPaymentId },
      });
      if (settled.count !== 1) {
        throw new AppError(409, "PAYMENT_ALREADY_SETTLED", "This payment has already been processed.");
      }
      const confirmed = await transaction.booking.updateMany({
        where: {
          id: storedPayment.bookingId,
          status: BookingStatus.PENDING,
        },
        data: { status: BookingStatus.CONFIRMED },
      });
      if (confirmed.count !== 1) {
        throw new AppError(409, "PAYMENT_NOT_PENDING", "This booking can no longer be paid.");
      }

      const tickets = storedPayment.booking.items.flatMap((item) =>
        Array.from({ length: item.quantity }, () => ({
          bookingId: storedPayment.bookingId,
          eventId: storedPayment.booking.eventId,
          qrToken: randomBytes(32).toString("base64url"),
        })),
      );
      if (tickets.length > 0) {
        await transaction.ticket.createMany({ data: tickets });
      }
    });
  } catch (error) {
    if (
      error instanceof Error &&
      "code" in error &&
      error.code === "P2002"
    ) {
      const duplicate = await prisma.webhookEvent.findUnique({ where: { id: eventId } });
      if (duplicate) return { processed: false };
      throw new AppError(
        409,
        "PAYMENT_ALREADY_USED",
        "This provider payment has already been applied.",
      );
    }
    throw error;
  }
  return { processed: true };
}