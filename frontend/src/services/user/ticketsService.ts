import { ticketService, type TicketWithEvent } from "../ticket.service";

export type { TicketWithEvent };

export async function getUserTickets(): Promise<TicketWithEvent[]> {
  return ticketService.getMyTickets();
}

export default { getUserTickets };
