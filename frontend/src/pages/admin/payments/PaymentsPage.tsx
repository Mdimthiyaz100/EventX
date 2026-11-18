import { useQuery } from "@tanstack/react-query";
import {
  CreditCard,
  AlertCircle,
} from "lucide-react";
import { useMemo, useState } from "react";
import { listAdminTransactions, type AdminTransaction } from "../../../services/adminService";

export default function AdminPaymentsPage() {
  const [status, setStatus] = useState<string>("");
  const [page, setPage] = useState(1);

  const params = useMemo(
    () => ({
      page,
      limit: 20,
      status: (status as any) || undefined,
    }),
    [page, status],
  );

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["admin-transactions", params],
    queryFn: () => listAdminTransactions(params),
  });

  const formatPrice = (amount: number | string) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(amount));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-[11px] font-extrabold uppercase tracking-[.25em] text-[#E31824]">
            FINANCIAL MONITORING
          </p>
          <h1 className="mt-1 font-display text-4xl font-extrabold uppercase tracking-tight text-slate-900">
            Payments & Transactions
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Real-time ledger of verified payment checkouts, settlement statuses, and gateway callbacks.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 outline-none focus:border-[#E31824]"
          >
            <option value="">All Payment Statuses</option>
            <option value="PAID">PAID</option>
            <option value="PENDING">PENDING</option>
            <option value="FAILED">FAILED</option>
            <option value="REFUNDED">REFUNDED</option>
          </select>
        </div>
      </div>

      {isError && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-600">
          <AlertCircle size={16} />
          <span>{error instanceof Error ? error.message : "Failed to load transactions"}</span>
        </div>
      )}

      {/* Transactions Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="size-8 animate-spin rounded-full border-3 border-slate-200 border-t-[#E31824]" />
          </div>
          ) : !data || data.payments.length === 0 ? (
          <div className="py-16 text-center">
            <CreditCard size={40} className="mx-auto text-slate-300 mb-3" />
            <h3 className="text-sm font-bold text-slate-800">No Transactions Found</h3>
            <p className="mt-1 text-xs text-slate-400">
              Payments processed via online checkout will be recorded here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 bg-[#FAF7F2] text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="py-3.5 px-5">Payment ID</th>
                  <th className="py-3.5 px-5">Booking Ref</th>
                  <th className="py-3.5 px-5">Customer / Event</th>
                  <th className="py-3.5 px-5">Amount</th>
                  <th className="py-3.5 px-5">Provider</th>
                  <th className="py-3.5 px-5">Status</th>
                  <th className="py-3.5 px-5">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {data.payments.map((tx: AdminTransaction) => (
                  <tr key={tx.id} className="hover:bg-slate-50/50">
                    <td className="py-4 px-5 font-mono text-[11px] font-bold text-slate-900">
                      {tx.id}
                    </td>
                    <td className="py-4 px-5 font-mono text-[11px] text-[#E31824]">
                      {tx.booking.id}
                    </td>
                    <td className="py-4 px-5">
                      <div className="font-bold text-slate-900">
                        {tx.booking?.user?.name || "Customer"}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {tx.booking?.event?.title || tx.booking?.user?.email || "—"}
                      </div>
                    </td>
                    <td className="py-4 px-5 font-bold text-slate-900">
                      {formatPrice(tx.amount)}
                    </td>
                    <td className="py-4 px-5 text-slate-500">
                      {tx.providerPaymentId || tx.providerReferenceId || "—"}
                    </td>
                    <td className="py-4 px-5">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          tx.status === "PAID"
                            ? "bg-emerald-50 text-emerald-700"
                            : tx.status === "PENDING"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        {tx.status}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-[11px] text-slate-400">
                      {new Date(tx.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {data && data.pagination.pages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 text-xs text-slate-500">
            <span>
              Page {data.pagination.page} of {data.pagination.pages} ({data.pagination.total} total)
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-lg border border-slate-200 px-3 py-1 font-bold disabled:opacity-40"
              >
                Previous
              </button>
              <button
                disabled={page >= data.pagination.pages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-lg border border-slate-200 px-3 py-1 font-bold disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
