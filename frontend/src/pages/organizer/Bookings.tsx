import { useState, useEffect } from "react";
import {
  Ticket,
  Search,
  AlertCircle,
  Eye,
  RefreshCw,
} from "lucide-react";
import {
  organizerService,
  type OrganizerBookingRecord,
} from "../../services/organizer.service";

export default function Bookings() {
  const [bookings, setBookings] = useState<OrganizerBookingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "CONFIRMED" | "PENDING" | "CANCELLED">("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<OrganizerBookingRecord | null>(null);

  const loadBookings = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await organizerService.getBookings();
      setBookings(data || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load bookings.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadBookings();
  }, []);

  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      b.bookingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.listingTitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "ALL" ? true : b.bookingStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 text-white">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
            Customer Bookings
          </h1>
          <p className="mt-1 text-xs text-[#A1A1AA]">
            Track confirmed admissions, turf slot reservations, and pending payment statuses.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => void loadBookings()}
            className="inline-flex items-center gap-2 rounded-xl border border-[#292929] bg-[#141414] px-3.5 py-2 text-xs font-semibold text-white hover:border-[#3a3a3a] transition"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-xs font-semibold text-red-400">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Filter and Search Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 rounded-2xl border border-[#292929] bg-[#141414] p-3.5">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#777777]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search bookings by ID, customer name, email, or facility..."
            className="w-full rounded-xl border border-[#292929] bg-[#1A1A1A] py-2 pl-10 pr-4 text-xs text-white placeholder-[#777777] outline-none focus:border-[#F51D2B]"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 rounded-xl border border-[#292929] bg-[#1A1A1A] p-1">
          {(["ALL", "CONFIRMED", "PENDING", "CANCELLED"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                statusFilter === s
                  ? "bg-[#F51D2B] text-white shadow-md shadow-[#F51D2B]/20"
                  : "text-[#A1A1AA] hover:text-white"
              }`}
            >
              {s === "ALL" ? "All Bookings" : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings Table */}
      {loading ? (
        <div className="flex min-h-[300px] items-center justify-center">
          <div className="size-8 animate-spin rounded-full border-2 border-white/20 border-t-[#F51D2B]" />
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="rounded-2xl border border-[#292929] bg-[#141414] p-12 text-center">
          <Ticket size={40} className="mx-auto text-[#777777]" />
          <h3 className="mt-4 text-base font-bold text-white">No bookings found</h3>
          <p className="mt-1 text-xs text-[#A1A1AA]">
            {searchTerm || statusFilter !== "ALL"
              ? "No booking matches the selected criteria."
              : "When customers book tickets or slots for your listings, they will show up here."}
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-[#292929] bg-[#141414] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#292929] bg-[#1A1A1A]/60 text-[11px] font-semibold text-[#777777]">
                  <th className="py-3.5 pl-5">Booking ID</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Listing / Facility</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Payment</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 pr-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222222]">
                {filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-[#1A1A1A]/40 transition">
                    <td className="py-4 pl-5 font-mono font-bold text-white">
                      {b.bookingId}
                    </td>
                    <td className="py-4 px-4">
                      <p className="font-semibold text-white">{b.customerName}</p>
                      <p className="text-[11px] text-[#777777]">{b.customerEmail}</p>
                    </td>
                    <td className="py-4 px-4 text-[#A1A1AA]">
                      <p className="font-medium text-white">{b.listingTitle}</p>
                      <p className="text-[11px] text-[#777777]">{b.venue}</p>
                    </td>
                    <td className="py-4 px-4 text-[#A1A1AA]">
                      {new Date(b.bookingDate).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-4 px-4 font-bold text-white">
                      ₹{b.amount.toLocaleString("en-IN")}
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          b.paymentStatus === "PAID"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-amber-500/10 text-amber-400"
                        }`}
                      >
                        {b.paymentStatus}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          b.bookingStatus === "CONFIRMED"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : b.bookingStatus === "PENDING"
                            ? "bg-amber-500/10 text-amber-400"
                            : "bg-red-500/10 text-red-400"
                        }`}
                      >
                        {b.bookingStatus}
                      </span>
                    </td>
                    <td className="py-4 pr-5 text-right">
                      <button
                        onClick={() => setSelectedBooking(b)}
                        className="inline-flex items-center gap-1 rounded-lg border border-[#292929] bg-[#1A1A1A] px-2.5 py-1 text-[11px] font-medium text-white transition hover:border-[#3a3a3a] hover:bg-[#252525]"
                      >
                        <Eye size={12} />
                        <span>Details</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-[#292929] bg-[#141414] p-6">
            <div className="flex items-center justify-between border-b border-[#292929] pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#777777]">
                  Booking Reference
                </span>
                <h3 className="font-mono text-lg font-bold text-white">
                  {selectedBooking.bookingId}
                </h3>
              </div>
              <span
                className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                  selectedBooking.bookingStatus === "CONFIRMED"
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "bg-amber-500/10 text-amber-400"
                }`}
              >
                {selectedBooking.bookingStatus}
              </span>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div>
                <p className="text-[11px] text-[#777777]">Event / Facility</p>
                <p className="font-semibold text-white">{selectedBooking.listingTitle}</p>
                <p className="text-[11px] text-[#A1A1AA]">{selectedBooking.venue}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 border-t border-[#292929] pt-3">
                <div>
                  <p className="text-[11px] text-[#777777]">Customer Name</p>
                  <p className="font-medium text-white">{selectedBooking.customerName}</p>
                </div>
                <div>
                  <p className="text-[11px] text-[#777777]">Customer Email</p>
                  <p className="font-medium text-white truncate">{selectedBooking.customerEmail}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 border-t border-[#292929] pt-3">
                <div>
                  <p className="text-[11px] text-[#777777]">Total Paid</p>
                  <p className="font-bold text-white">
                    ₹{selectedBooking.amount.toLocaleString("en-IN")}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-[#777777]">Payment Status</p>
                  <p className="font-bold text-emerald-400">{selectedBooking.paymentStatus}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedBooking(null)}
                className="rounded-xl bg-[#F51D2B] px-5 py-2 text-xs font-bold text-white hover:bg-[#ff2b39]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
