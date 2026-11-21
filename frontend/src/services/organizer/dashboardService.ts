import { organizerService } from "../organizer.service";

export async function getOrganizerDashboard() {
  const events = await organizerService.getMyEvents();
  const totalEvents = events.length;
  const publishedEvents = events.filter((e) => e.status === "PUBLISHED").length;
  return {
    totalEvents,
    publishedEvents,
    events,
  };
}

export default { getOrganizerDashboard };
