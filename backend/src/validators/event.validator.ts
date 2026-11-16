import { z } from "zod";

const ticketTypeSchema = z
  .object({
    name: z.string().trim().min(1).max(100),
    price: z.number().nonnegative().max(1_000_000),
    capacity: z.number().int().positive().max(100_000),
  })
  .strict();

const eventFields = z.object({
  title: z.string().trim().min(3).max(180),
  description: z.string().trim().min(10).max(10_000),
  category: z.string().trim().min(2).max(80),
  city: z.string().trim().min(2).max(100),
  venue: z.string().trim().min(2).max(180),
  imageUrl: z.string().url().max(500).optional(),
  startAt: z.string().datetime(),
  endAt: z.string().datetime(),
});

export const createEventSchema = eventFields
  .extend({ ticketTypes: z.array(ticketTypeSchema).min(1).max(20) })
  .strict()
  .refine((value) => new Date(value.endAt) > new Date(value.startAt), {
    message: "Event end must be after its start.",
    path: ["endAt"],
  });

export const updateEventSchema = eventFields
  .partial()
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: "Provide at least one event field to update.",
  })
  .refine(
    (value) =>
      !value.startAt ||
      !value.endAt ||
      new Date(value.endAt) > new Date(value.startAt),
    { message: "Event end must be after its start.", path: ["endAt"] },
  );

export const eventListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
  search: z.string().trim().max(100).optional(),
  city: z.string().trim().max(100).optional(),
  category: z.string().trim().max(80).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  featured: z.enum(["true", "false"]).optional(),
});
