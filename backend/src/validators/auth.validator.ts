import { z } from "zod";

export const registerSchema = z
  .object({
    name: z.string().trim().min(2).max(120),
    email: z.string().trim().email().max(191),
    password: z.string().min(8).max(128),
    phone: z.union([z.string().regex(/^\+?[0-9\s-]{7,16}$/), z.literal("")]).optional(),
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

export const setupSecurityQuestionsSchema = z
  .object({
    answers: z
      .array(
        z.object({
          questionId: z.string().min(1),
          answer: z.string().trim().min(1).max(200),
        }),
      )
      .length(3, "Exactly 3 security questions must be selected.")
      .refine(
        (items) => {
          const ids = new Set(items.map((i) => i.questionId));
          return ids.size === 3;
        },
        { message: "Duplicate security questions are not allowed." },
      ),
  })
  .strict();

export const forgotPasswordInitiateSchema = z
  .object({
    email: z.string().trim().email().max(191),
  })
  .strict();

export const verifySecurityAnswersSchema = z
  .object({
    email: z.string().trim().email().max(191),
    answers: z
      .array(
        z.object({
          questionId: z.string().min(1),
          answer: z.string().trim().min(1).max(200),
        }),
      )
      .min(1)
      .max(5),
  })
  .strict();

export const resetPasswordSecuritySchema = z
  .object({
    recoveryToken: z.string().min(32).max(128),
    newPassword: z.string().min(8).max(128),
  })
  .strict();

