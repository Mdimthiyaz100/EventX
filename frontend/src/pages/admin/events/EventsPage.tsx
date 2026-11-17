import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  Eye,
  MapPin,
  Pencil,
  Plus,
  Search,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Modal from "../../../components/common/Modal";
import {
  deleteAdminEvent,
  listAdminEvents,
  reviewAdminEvent,
  type AdminEvent,
} from "../../../services/adminService";

export default function EventsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const [selectedEvent, setSelectedEvent] = useState<AdminEvent | null>(null);
  const [deleteEventItem, setDeleteEventItem] = useState<AdminEvent | null>(null);
  const [feedback, setFeedback] = useState("");

  const params = useMemo(
    () => ({
      page,
      limit: 10,
      search: search || undefined,
      status: status || undefined,
      category: category || undefined,
    }),
    [page, search, status, category],
  );

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["admin-events", params],
    queryFn: () => listAdminEvents(params),
  });

  const reviewMutation = useMutation({
    mutationFn: ({ id, publish }: { id: string; publish: boolean }) =>
      reviewAdminEvent(id, publish),
    onSuccess: () => {
      setFeedback("Event status updated successfully.");
      void queryClient.invalidateQueries({ queryKey: ["admin-events"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
    },
    onError: (err) => {
      setFeedback(err instanceof Error ? err.message : "Failed to update status.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAdminEvent(id),
    onSuccess: () => {
      setDeleteEventItem(null);
      setFeedback("Event removed successfully.");
      void queryClient.invalidateQueries({ queryKey: ["admin-events"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
    },
    onError: (err) => {
      setFeedback(err instanceof Error ? err.message : "Failed to delete event.");
    },
  });

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

  const formatPrice = (price: number | string) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(price));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-[11px] font-extrabold uppercase tracking-[.25em] text-[#E31824]">
            LIVE EXPERIENCES
          </p>
          <h1 className="mt-1 font-display text-4xl font-extrabold uppercase tracking-tight text-slate-900">
            Event Management
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Create, publish, organize and monitor tickets across all event categories.
          </p>
        </div>

        <Link
          to="/admin/events/new"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#E31824] px-5 text-xs font-bold text-white shadow-lg shadow-[#E31824]/20 transition hover:bg-[#c4141e]"
        >
          <Plus size={16} />
          <span>Create Event</span>
        </Link>
      </div>

      {/* Success / Error Feedback Alert */}
      {feedback && (
        <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-800">
          <div className="flex items-center gap-2">
            <Check size={16} />
            <span>{feedback}</span>
          </div>
          <button onClick={() => setFeedback("")} className="hover:opacity-75">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <section className="rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 lg:flex-row lg:items-center lg:p-5">
          {/* Search */}
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
              placeholder="Search by event title, city or venue..."
              className="h-10 w-full rounded-xl border border-slate-200 bg-[#FCF9F4] pl-9 pr-4 text-xs font-medium text-slate-800 outline-none transition focus:border-[#E31824] focus:bg-white"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              aria-label="Filter events by status"
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 outline-none focus:border-[#E31824]"
            >
              <option value="">All Statuses</option>
              <option value="PUBLISHED">Published</option>
              <option value="DRAFT">Draft</option>
              <option value="CANCELLED">Cancelled</option>
            </select>

            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              aria-label="Filter events by category"
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 outline-none focus:border-[#E31824]"
            >
              <option value="">All Categories</option>
              <option value="Music">Music</option>
              <option value="Concert">Concert</option>
              <option value="Comedy">Comedy</option>
              <option value="Tech">Tech</option>
              <option value="Food">Food</option>
              <option value="Sports">Sports</option>
            </select>
          </div>
        </div>

        {/* Error message */}
        {isError && (
          <div className="m-5 rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-700">
            {error instanceof Error ? error.message : "Could not load events."}
          </div>
        )}

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left">
            <thead>
              <tr className="bg-slate-50/75 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                <th className="px-5 py-3.5">Event Details</th>
                <th className="px-4 py-3.5">Category & Location</th>
                <th className="px-4 py-3.5">Schedule</th>
                <th className="px-4 py-3.5">Ticket Pricing</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }, (_, i) => (
                  <tr key={i} className="border-t border-slate-100">
                    <td colSpan={6} className="px-5 py-4">
                      <div className="h-12 w-full animate-pulse rounded-xl bg-slate-100" />
                    </td>
                  </tr>
                ))
              ) : data?.events && data.events.length > 0 ? (
                data.events.map((event) => {
                  const lowestPrice =
                    event.ticketTypes && event.ticketTypes.length > 0
                      ? Math.min(...event.ticketTypes.map((t) => Number(t.price)))
                      : null;

                  return (
                    <tr
                      key={event.id}
                      className="border-t border-slate-100 text-xs transition-colors hover:bg-slate-50/60"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-xl bg-slate-100 text-slate-400">
                            {event.imageUrl ? (
                              <img
                                src={event.imageUrl}
                                alt=""
                                className="size-full object-cover"
                              />
                            ) : (
                              <Calendar size={18} />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="max-w-[260px] truncate font-bold text-slate-800">
                              {event.title}
                            </p>
                            <p className="mt-0.5 truncate text-[11px] text-slate-400">
                              By {event.organizer?.name || "EventX Admin"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center gap-1 font-semibold text-slate-700">
                          <Tag size={13} className="text-slate-400" />
                          {event.category}
                        </span>
                        <p className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-400">
                          <MapPin size={12} />
                          {event.city} · {event.venue}
                        </p>
                      </td>

                      <td className="px-4 py-3.5 font-medium text-slate-600">
                        {formatDate(event.startAt)}
                      </td>

                      <td className="px-4 py-3.5">
                        {lowestPrice !== null ? (
                          <span className="font-bold text-slate-800">
                            From {formatPrice(lowestPrice)}
                          </span>
                        ) : (
                          <span className="text-slate-400">TBD</span>
                        )}
                        <span className="block text-[11px] text-slate-400">
                          {event.ticketTypes?.length || 0} tier(s)
                        </span>
                      </td>

                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-extrabold ${
                            event.status === "PUBLISHED"
                              ? "bg-emerald-50 text-emerald-700"
                              : event.status === "CANCELLED"
                                ? "bg-red-50 text-red-700"
                                : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {event.status}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            title="Quick View"
                            onClick={() => setSelectedEvent(event)}
                            className="grid size-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                          >
                            <Eye size={15} />
                          </button>

                          <Link
                            title="Edit Event"
                            to={`/admin/events/${event.id}/edit`}
                            className="grid size-8 place-items-center rounded-lg text-slate-500 hover:bg-blue-50 hover:text-blue-600"
                          >
                            <Pencil size={15} />
                          </Link>

                          <button
                            title={event.status === "PUBLISHED" ? "Unpublish Event" : "Publish Event"}
                            disabled={reviewMutation.isPending}
                            onClick={() =>
                              reviewMutation.mutate({
                                id: event.id,
                                publish: event.status !== "PUBLISHED",
                              })
                            }
                            className={`rounded-lg border px-2.5 py-1 text-[10px] font-bold transition ${
                              event.status === "PUBLISHED"
                                ? "border-amber-200 text-amber-700 hover:bg-amber-50"
                                : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                            }`}
                          >
                            {event.status === "PUBLISHED" ? "Unpublish" : "Publish"}
                          </button>

                          <button
                            title="Delete Event"
                            onClick={() => setDeleteEventItem(event)}
                            className="grid size-8 place-items-center rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center">
                    <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-red-50 text-[#E31824]">
                      <Calendar size={22} />
                    </div>
                    <p className="mt-3 text-sm font-bold text-slate-800">
                      No events found
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      Create your first live experience or try relaxing your filters.
                    </p>
                    <Link
                      to="/admin/events/new"
                      className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-[#E31824] hover:underline"
                    >
                      <Plus size={14} /> Create an Event
                    </Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {data?.pagination && data.pagination.pages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4 text-xs font-medium text-slate-500">
            <span>
              Page {page} of {data.pagination.pages} · {data.pagination.total} total
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

      {/* Quick View Modal */}
      {selectedEvent && (
        <Modal title={selectedEvent.title} onClose={() => setSelectedEvent(null)}>
          <div className="space-y-4 text-xs text-slate-600">
            {selectedEvent.imageUrl && (
              <img
                src={selectedEvent.imageUrl}
                alt=""
                className="h-44 w-full rounded-xl object-cover"
              />
            )}
            <div>
              <p className="font-extrabold uppercase tracking-wider text-slate-400 text-[10px]">Description</p>
              <p className="mt-1 leading-relaxed text-slate-700">{selectedEvent.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="rounded-xl bg-slate-50 p-3">
                <span className="font-bold text-slate-500">Category & City:</span>
                <p className="font-bold text-slate-800">{selectedEvent.category} · {selectedEvent.city}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <span className="font-bold text-slate-500">Venue:</span>
                <p className="font-bold text-slate-800">{selectedEvent.venue}</p>
              </div>
            </div>
            <div className="pt-2">
              <p className="font-extrabold uppercase tracking-wider text-slate-400 text-[10px]">Ticket Tiers</p>
              <div className="mt-2 space-y-2">
                {selectedEvent.ticketTypes?.map((tier) => (
                  <div key={tier.name} className="flex justify-between rounded-lg border border-slate-100 p-2.5 font-medium">
                    <span>{tier.name}</span>
                    <span className="font-bold text-slate-800">
                      {formatPrice(tier.price)} ({tier.capacity} capacity)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deleteEventItem && (
        <Modal title="Delete Event?" onClose={() => setDeleteEventItem(null)}>
          <p className="text-sm leading-relaxed text-slate-600">
            Are you sure you want to delete <strong>{deleteEventItem.title}</strong>? If attendees have already booked tickets, the event will safely transition to Cancelled status.
          </p>
          <div className="mt-6 flex justify-end gap-2">
            <button
              onClick={() => setDeleteEventItem(null)}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600"
            >
              Cancel
            </button>
            <button
              disabled={deleteMutation.isPending}
              onClick={() => deleteMutation.mutate(deleteEventItem.id)}
              className="rounded-xl bg-[#E31824] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#c4141e] disabled:opacity-50"
            >
              {deleteMutation.isPending ? "Deleting…" : "Delete Event"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
