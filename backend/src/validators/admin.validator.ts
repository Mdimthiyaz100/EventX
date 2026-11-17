import { z } from "zod";

export const transactionQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(["PENDING", "PAID", "FAILED", "REFUNDED"]).optional(),
});

export const adminListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(100).optional(),
  status: z.string().trim().max(30).optional(),
  role: z.enum(["CUSTOMER", "ORGANIZER", "ADMIN"]).optional(),
  category: z.string().trim().max(80).optional(),
});
