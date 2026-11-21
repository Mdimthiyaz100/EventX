import { apiRequest } from "../api";
import type { AdminUser, PaginatedResult } from "../adminService";

export type { AdminUser };

export async function listAdminUsers(params?: {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
}): Promise<{ users: AdminUser[]; pagination: PaginatedResult<AdminUser>["pagination"] }> {
  return apiRequest("GET", "/admin/users", undefined, params);
}

export const listUsers = listAdminUsers;
export default { listAdminUsers, listUsers };
