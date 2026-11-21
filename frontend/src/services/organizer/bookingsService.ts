import { organizerService, type AttendeeItem } from "../organizer.service";

export type { AttendeeItem };

export async function getAttendees(eventId: string): Promise<AttendeeItem[]> {
  return organizerService.getAttendees(eventId);
}

export default { getAttendees };
