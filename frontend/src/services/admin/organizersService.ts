import { apiRequest } from "../api";
import { listAdminUsers } from "./usersService";
import type { AdminUser, PaginatedResult } from "../adminService";

export async function listOrganizers(params?: {
  page?: number;
  limit?: number;
  search?: string;
}): Promise<{ users: AdminUser[]; pagination: PaginatedResult<AdminUser>["pagination"] }> {
  return listAdminUsers({ ...params, role: "ORGANIZER" });
}

export async function updateOrganizerApproval(id: string, approved: boolean): Promise<{ success: boolean }> {
  return apiRequest("PATCH", `/admin/organizers/${encodeURIComponent(id)}/approval`, { approved });
}

export const setOrganizerApproval = updateOrganizerApproval;
export default { listOrganizers, updateOrganizerApproval, setOrganizerApproval };
