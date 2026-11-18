import { apiRequest } from "./api";

export interface PaymentLinkResponse {
  paymentId: string;
  orderId: string;
  paymentUrl: string;
}

export const paymentService = {
  async createPaymentLink(bookingId: string): Promise<PaymentLinkResponse> {
    return apiRequest<PaymentLinkResponse>("POST", "/payments/links", { bookingId });
  },
};
