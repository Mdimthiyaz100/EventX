import { z } from "zod";

const optionalSecret = (minimumLength: number) =>
  z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.string().min(minimumLength).optional(),
  );

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().min(1).max(65535).default(4000),

  DATABASE_URL: z.string().min(1),

  DB_HOST: z.string().min(1).default("eventx-mysql-eventx.k.aivencloud.com"),
  DB_PORT: z.coerce.number().int().min(1).max(65535).default(15639),
  DB_USER: z.string().min(1).default("avnadmin"),
  DB_PASSWORD: z.string().min(1),
  DB_NAME: z.string().min(1).default("eventx_db"),

  CLIENT_ORIGIN: z.string().url().default("http://localhost:5173"),

  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),

  JWT_ACCESS_TTL: z.string().default("15m"),
  JWT_REFRESH_TTL_DAYS: z.coerce.number().int().positive().default(30),

  PAYMENT_WEBHOOK_SECRET: optionalSecret(16),
  RAZORPAY_KEY_ID: optionalSecret(1),
  RAZORPAY_KEY_SECRET: optionalSecret(16),

  UPLOAD_DIR: z.string().default("uploads"),
  UPLOAD_MAX_BYTES: z.coerce.number().int().positive().max(10_485_760).default(5_242_880),

  CLOUDINARY_CLOUD_NAME: optionalSecret(1),
  CLOUDINARY_API_KEY: optionalSecret(1),
  CLOUDINARY_API_SECRET: optionalSecret(1),
})
  .refine(
    (values) => values.JWT_ACCESS_SECRET !== values.JWT_REFRESH_SECRET,
    { message: "JWT access and refresh secrets must be different." },
  )
  .refine(
    (values) =>
      Boolean(values.RAZORPAY_KEY_ID) === Boolean(values.RAZORPAY_KEY_SECRET),
    { message: "Set both Razorpay API credentials or leave both empty." },
  )
  .refine(
    (values) => {
      const cloudinary = [
        values.CLOUDINARY_CLOUD_NAME,
        values.CLOUDINARY_API_KEY,
        values.CLOUDINARY_API_SECRET,
      ];
      return cloudinary.every(Boolean) || cloudinary.every((value) => !value);
    },
    { message: "Set all Cloudinary credentials or leave all three empty." },
  );

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join("; ");

  throw new Error(`Invalid environment configuration: ${issues}`);
}

export const env = parsed.data;