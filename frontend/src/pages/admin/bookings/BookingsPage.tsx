import { useQuery } from "@tanstack/react-query";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  Search,
  Ticket,
} from "lucide-react";
import { useMemo, useState } from "react";
import Modal from "../../../components/common/Modal";
import {
  listAdminBookings,
  type AdminBooking,
} from "../../../services/adminService";

export default function BookingsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [selectedBooking, setSelectedBooking] = useState<AdminBooking | null>(null);

  const params = useMemo(
    () => ({
      page,
      limit: 15,
      search: search || undefined,
      status: status || undefined,
    }),
    [page, search, status],
  );

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["admin-bookings", params],
    queryFn: () => listAdminBookings(params),
  });

  const formatPrice = (amount: number | string) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(amount));

  const formatDate = (iso: string) => {
    try {
      return new Intl.DateTimeFormat("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(iso));
    } catch {
      return iso;
    }
  };

  // Export to CSV Function
  const exportCsv = () => {
    const bookings = data?.bookings || [];
    if (bookings.length === 0) {
      alert("No booking data available to export.");
      return;
    }

    const headers = [
      "Booking ID",
      "Customer Name",
      "Customer Email",
      "Experience / Event",
      "Ticket Quantity",
      "Total Amount (INR)",
      "Booking Status",
      "Payment Status",
      "Booking Date",
    ];

    const rows = bookings.map((b) => [
      `"${b.id}"`,
      `"${b.user?.name || ""}"`,
      `"${b.user?.email || ""}"`,
      `"${b.event?.title || ""}"`,
      b._count?.items || 1,
      Number(b.totalAmount),
      `"${b.status}"`,
      `"${b.payment?.status || "UNPAID"}"`,
      `"${new Date(b.createdAt).toLocaleString("en-IN")}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `eventx-bookings-${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-[11px] font-extrabold uppercase tracking-[.25em] text-[#E31824]">
            TRANSACTIONS & ORDERS
          </p>
          <h1 className="mt-1 font-display text-4xl font-extrabold uppercase tracking-tight text-slate-900">
            Bookings Management
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Review customer reservations, ticket allotments, and payment settlements.
          </p>
        </div>

        <button
          onClick={exportCsv}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-xs font-bold text-slate-700 shadow-sm transition hover:border-[#E31824] hover:text-[#E31824]"
        >
          <Download size={15} />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Filter Bar */}
      <section className="rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 lg:flex-row lg:items-center lg:p-5">
          <div className="relative flex-1">
            <Search
              size={16}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by Booking ID, customer name, email or event..."
              className="h-10 w-full rounded-xl border border-slate-200 bg-[#FCF9F4] pl-9 pr-4 text-xs font-medium text-slate-800 outline-none focus:border-[#E31824] focus:bg-white"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              aria-label="Filter bookings by status"
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 outline-none focus:border-[#E31824]"
            >
              <option value="">All Statuses</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="PENDING">Pending</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="EXPIRED">Expired</option>
            </select>
          </div>
        </div>

        {isError && (
          <div className="m-5 rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-700">
            {error instanceof Error ? error.message : "Could not load bookings."}
          </div>
        )}

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left">
            <thead>
              <tr className="bg-slate-50/75 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                <th className="px-5 py-3.5">Booking ID & Date</th>
                <th className="px-4 py-3.5">Customer</th>
                <th className="px-4 py-3.5">Experience / Event</th>
                <th className="px-4 py-3.5">Tickets</th>
                <th className="px-4 py-3.5">Amount</th>
                <th className="px-4 py-3.5">Booking Status</th>
                <th className="px-4 py-3.5">Payment</th>
                <th className="px-4 py-3.5 text-right">Details</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 6 }, (_, i) => (
                  <tr key={i} className="border-t border-slate-100">
                    <td colSpan={8} className="px-5 py-4">
                      <div className="h-10 w-full animate-pulse rounded-xl bg-slate-100" />
                    </td>
                  </tr>
                ))
              ) : data?.bookings && data.bookings.length > 0 ? (
                data.bookings.map((booking) => (
                  <tr
                    key={booking.id}
                    className="border-t border-slate-100 text-xs transition-colors hover:bg-slate-50/60"
                  >
                    <td className="px-5 py-3.5">
                      <p className="font-mono font-bold text-slate-800">
                        #{booking.id.slice(-8).toUpperCase()}
                      </p>
                      <p className="mt-0.5 text-[11px] text-slate-400">
                        {formatDate(booking.createdAt)}
                      </p>
                    </td>

                    <td className="px-4 py-3.5">
                      <p className="font-bold text-slate-800">{booking.user?.name}</p>
                      <p className="mt-0.5 text-[11px] text-slate-400">{booking.user?.email}</p>
                    </td>

                    <td className="px-4 py-3.5 font-medium text-slate-700">
                      <p className="max-w-[220px] truncate font-semibold">
                        {booking.event?.title}
                      </p>
                      <p className="text-[11px] text-slate-400">{booking.event?.city}</p>
                    </td>

                    <td className="px-4 py-3.5 font-bold text-slate-700">
                      {booking._count?.items || 1} pass(es)
                    </td>

                    <td className="px-4 py-3.5 font-extrabold text-slate-900">
                      {formatPrice(booking.totalAmount)}
                    </td>

                    <td className="px-4 py-3.5">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold ${
                          booking.status === "CONFIRMED"
                            ? "bg-emerald-50 text-emerald-700"
                            : booking.status === "PENDING"
                              ? "bg-amber-50 text-amber-700"
                              : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {booking.status}
                      </span>
                    </td>

                    <td className="px-4 py-3.5">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold ${
                          booking.payment?.status === "PAID"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {booking.payment?.status || "UNPAID"}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      <button
                        title="View Full Booking Details"
                        onClick={() => setSelectedBooking(booking)}
                        className="grid size-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                      >
                        <Eye size={15} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-5 py-14 text-center">
                    <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-red-50 text-[#E31824]">
                      <Ticket size={22} />
                    </div>
                    <p className="mt-3 text-sm font-bold text-slate-800">No bookings found</p>
                    <p className="mt-1 text-xs text-slate-400">
                      Reservations will appear here as customers complete checkout.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data?.pagination && data.pagination.pages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4 text-xs font-medium text-slate-500">
            <span>
              Page {page} of {data.pagination.pages} · {data.pagination.total} records
            </span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronLeft size={14} /> Previous
              </button>
              <button
                disabled={page >= data.pagination.pages}
                onClick={() => setPage((p) => Math.min(data.pagination.pages, p + 1))}
                className="flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold hover:bg-slate-50 disabled:opacity-40"
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <Modal
          title={`Booking Details #${selectedBooking.id.slice(-8).toUpperCase()}`}
          onClose={() => setSelectedBooking(null)}
        >
          <div className="space-y-4 text-xs">
            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
              <p className="font-extrabold uppercase tracking-wider text-slate-400 text-[10px]">Customer Information</p>
              <div className="mt-2 space-y-1">
                <p className="text-sm font-bold text-slate-900">{selectedBooking.user?.name}</p>
                <p className="text-slate-500">{selectedBooking.user?.email}</p>
                {selectedBooking.user?.phone && (
                  <p className="text-slate-500">{selectedBooking.user.phone}</p>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
              <p className="font-extrabold uppercase tracking-wider text-slate-400 text-[10px]">Experience</p>
              <div className="mt-2">
                <p className="text-sm font-bold text-slate-900">{selectedBooking.event?.title}</p>
                <p className="text-slate-500">{selectedBooking.event?.venue}, {selectedBooking.event?.city}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-slate-50 p-3">
                <span className="font-bold text-slate-400 text-[10px] uppercase">Booking Status</span>
                <p className="mt-1 font-bold text-slate-800">{selectedBooking.status}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <span className="font-bold text-slate-400 text-[10px] uppercase">Payment Status</span>
                <p className="mt-1 font-bold text-slate-800">{selectedBooking.payment?.status || "UNPAID"}</p>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-3">
              <span className="font-bold text-slate-500">Total Settled Amount</span>
              <span className="text-base font-black text-[#E31824]">
                {formatPrice(selectedBooking.totalAmount)}
              </span>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
