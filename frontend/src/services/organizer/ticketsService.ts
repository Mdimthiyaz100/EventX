import { organizerService } from "../organizer.service";

export async function checkInTicket(eventId: string, qrToken: string): Promise<{ success: boolean; message: string }> {
  return organizerService.checkInTicket(eventId, qrToken);
}

export default { checkInTicket };
