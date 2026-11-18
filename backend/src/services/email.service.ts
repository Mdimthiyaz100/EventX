export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(_payload: EmailPayload): Promise<void> {
  // Stub for production SMTP email dispatch service
}
