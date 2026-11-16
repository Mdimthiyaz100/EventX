import Razorpay from "razorpay";
import { env } from "./env.js";
import { AppError } from "../utils/http.js";

export function getRazorpayClient(): Razorpay {
  if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
    throw new AppError(
      503,
      "PAYMENTS_NOT_CONFIGURED",
      "Razorpay API credentials are not configured.",
    );
  }
  return new Razorpay({
    key_id: env.RAZORPAY_KEY_ID,
    key_secret: env.RAZORPAY_KEY_SECRET,
  });
}