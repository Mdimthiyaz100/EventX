import { z } from "zod";

export const createBookingSchema = z
  .object({
    eventId: z.string().min(1).max(64),
    items: z
      .array(
        z
          .object({
            ticketTypeId: z.string().min(1).max(64),
            quantity: z.number().int().min(1).max(10),
          })
          .strict(),
      )
      .min(1)
      .max(20),
  })
  .strict()
  .refine(
    (value) =>
      new Set(value.items.map((item) => item.ticketTypeId)).size ===
      value.items.length,
    { message: "Each ticket type may only appear once.", path: ["items"] },
  );
