import { apiRequest } from "../api";
import type { DashboardStats } from "../adminService";

export type { DashboardStats };

export async function getAdminDashboard(): Promise<DashboardStats> {
  return apiRequest<DashboardStats>("GET", "/admin/dashboard");
}

export const fetchDashboard = getAdminDashboard;
export default { getAdminDashboard, fetchDashboard };
