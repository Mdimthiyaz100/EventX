import { paymentService, type PaymentLinkResponse } from "../payment.service";

export type { PaymentLinkResponse };

export async function createPaymentLink(bookingId: string): Promise<PaymentLinkResponse> {
  return paymentService.createPaymentLink(bookingId);
}

export default { createPaymentLink };
