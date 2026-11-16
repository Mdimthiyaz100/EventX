import { z } from "zod";

export const registerSchema = z
  .object({
    name: z.string().trim().min(2).max(120),
    email: z.string().trim().email().max(191),
    password: z.string().min(12).max(128),
    phone: z.string().regex(/^\+[1-9]\d{7,14}$/).optional(),
    accountType: z.enum(["CUSTOMER", "ORGANIZER"]).default("CUSTOMER"),
  })
  .strict();

export const loginSchema = z
  .object({
    email: z.string().trim().email().max(191),
    password: z.string().min(1).max(128),
  })
  .strict();

export const refreshSchema = z
  .object({ refreshToken: z.string().min(1) })
  .strict();

export const profileSchema = z
  .object({
    name: z.string().trim().min(2).max(120).optional(),
    phone: z.string().regex(/^\+[1-9]\d{7,14}$/).nullable().optional(),
  })
  .strict()
  .refine((value) => value.name !== undefined || value.phone !== undefined, {
    message: "Provide at least one profile field to update.",
  });
