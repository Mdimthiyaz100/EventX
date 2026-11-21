import { apiRequest } from "../api";
import type { AdminTransaction, PaginatedResult } from "../adminService";

export type { AdminTransaction };

export async function listAdminTransactions(params?: {
  page?: number;
  limit?: number;
  status?: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
}): Promise<{ payments: AdminTransaction[]; pagination: PaginatedResult<AdminTransaction>["pagination"] }> {
  return apiRequest("GET", "/admin/transactions", undefined, params);
}

export const listTransactions = listAdminTransactions;
export default { listAdminTransactions, listTransactions };
