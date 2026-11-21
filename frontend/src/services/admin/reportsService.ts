import { apiRequest } from "../api";
import type { AdminCategory } from "../adminService";

export type { AdminCategory };

export async function listAdminCategories(): Promise<AdminCategory[]> {
  return apiRequest<AdminCategory[]>("GET", "/admin/categories");
}

export const listCategories = listAdminCategories;
export default { listAdminCategories, listCategories };
