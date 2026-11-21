import { apiRequest } from "../api";
import type { AdminBooking, PaginatedResult } from "../adminService";

export type { AdminBooking };

export async function listAdminBookings(params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}): Promise<{ bookings: AdminBooking[]; pagination: PaginatedResult<AdminBooking>["pagination"] }> {
  return apiRequest("GET", "/admin/bookings", undefined, params);
}

export const listBookings = listAdminBookings;
export default { listAdminBookings, listBookings };
