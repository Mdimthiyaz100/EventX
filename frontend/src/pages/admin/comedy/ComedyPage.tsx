import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Eye,
  Mic,
  Plus,
  Search,
  Trash2,
  X,
  User,
} from "lucide-react";
import { useMemo, useState } from "react";
import Modal from "../../../components/common/Modal";
import {
  deleteAdminEvent,
  listAdminEvents,
  reviewAdminEvent,
  createAdminEvent,
  type AdminEvent,
} from "../../../services/adminService";

export default function ComedyPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedShow, setSelectedShow] = useState<AdminEvent | null>(null);
  const [deleteItem, setDeleteItem] = useState<AdminEvent | null>(null);
  const [feedback, setFeedback] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  // New Comedy Show state
  const [newShow, setNewShow] = useState({
    title: "",
    comedian: "",
    description: "",
    city: "Mumbai",
    venue: "The Habitat, Khar",
    imageUrl: "https://images.unsplash.com/photo-1585699324551-f6c309eedeca?auto=format&fit=crop&w=800&q=80",
    startAt: new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 16),
    endAt: new Date(Date.now() + 86400000 * 3 + 7200000).toISOString().slice(0, 16),
    price: 499,
    capacity: 120,
  });

  const params = useMemo(
    () => ({
      page,
      limit: 10,
      search: search || undefined,
      category: "Comedy",
    }),
    [page, search],
  );

  const { data, isLoading } = useQuery({
    queryKey: ["admin-comedy", params],
    queryFn: () => listAdminEvents(params),
  });

  const createMutation = useMutation({
    mutationFn: () => {
      return createAdminEvent({
        title: `${newShow.title} ft. ${newShow.comedian}`,
        description: `Comedian: ${newShow.comedian}\n\n${newShow.description}`,
        category: "Comedy",
        city: newShow.city,
        venue: newShow.venue,
        imageUrl: newShow.imageUrl,
        startAt: new Date(newShow.startAt).toISOString(),
        endAt: new Date(newShow.endAt).toISOString(),
        ticketTypes: [{ name: "Standard Entry", price: newShow.price, capacity: newShow.capacity }],
        status: "PUBLISHED",
      });
    },
    onSuccess: () => {
      setShowAddModal(false);
      setFeedback("Comedy show added to catalog!");
      void queryClient.invalidateQueries({ queryKey: ["admin-comedy"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-events"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
    },
    onError: (err) => {
      setFeedback(err instanceof Error ? err.message : "Failed to add comedy show.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAdminEvent(id),
    onSuccess: () => {
      setDeleteItem(null);
      setFeedback("Comedy show removed.");
      void queryClient.invalidateQueries({ queryKey: ["admin-comedy"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
    },
  });

  const reviewMutation = useMutation({
    mutationFn: ({ id, publish }: { id: string; publish: boolean }) =>
      reviewAdminEvent(id, publish),
    onSuccess: () => {
      setFeedback("Show publication updated.");
      void queryClient.invalidateQueries({ queryKey: ["admin-comedy"] });
    },
  });

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
            STAND-UP & GIGS
          </p>
          <h1 className="mt-1 font-display text-4xl font-extrabold uppercase tracking-tight text-slate-900">
            Comedy Shows
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Manage comedians, venues, stand-up specials, tour dates and tickets.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#E31824] px-5 text-xs font-bold text-white shadow-lg shadow-[#E31824]/20 transition hover:bg-[#c4141e]"
        >
          <Plus size={16} />
          <span>Add Comedy Show</span>
        </button>
      </div>

      {feedback && (
        <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-800">
          <div className="flex items-center gap-2">
            <Check size={16} />
            <span>{feedback}</span>
          </div>
          <button onClick={() => setFeedback("")}>
            <X size={14} />
          </button>
        </div>
      )}

      {/* Search and Table */}
      <section className="rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-4 lg:p-5">
          <div className="relative max-w-md">
            <Search
              size={16}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search comedy shows by title or comedian..."
              className="h-10 w-full rounded-xl border border-slate-200 bg-[#FCF9F4] pl-9 pr-4 text-xs font-medium text-slate-800 outline-none focus:border-[#E31824] focus:bg-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left">
            <thead>
              <tr className="bg-slate-50/75 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                <th className="px-5 py-3.5">Show & Comedian</th>
                <th className="px-4 py-3.5">Venue & City</th>
                <th className="px-4 py-3.5">Schedule</th>
                <th className="px-4 py-3.5">Ticket Price</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 4 }, (_, i) => (
                  <tr key={i} className="border-t border-slate-100">
                    <td colSpan={6} className="px-5 py-4">
                      <div className="h-12 w-full animate-pulse rounded-xl bg-slate-100" />
                    </td>
                  </tr>
                ))
              ) : data?.events && data.events.length > 0 ? (
                data.events.map((show) => {
                  const lowestPrice =
                    show.ticketTypes && show.ticketTypes.length > 0
                      ? Math.min(...show.ticketTypes.map((t) => Number(t.price)))
                      : 499;

                  return (
                    <tr
                      key={show.id}
                      className="border-t border-slate-100 text-xs transition-colors hover:bg-slate-50/60"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-xl bg-red-50 text-[#E31824]">
                            {show.imageUrl ? (
                              <img src={show.imageUrl} alt="" className="size-full object-cover" />
                            ) : (
                              <Mic size={18} />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="max-w-[240px] truncate font-bold text-slate-800">
                              {show.title}
                            </p>
                            <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                              <User size={12} /> Live Tour
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 text-slate-700">
                        <p className="font-semibold">{show.venue}</p>
                        <p className="text-[11px] text-slate-400">{show.city}</p>
                      </td>

                      <td className="px-4 py-3.5 text-slate-600 font-medium">
                        {new Date(show.startAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>

                      <td className="px-4 py-3.5 font-bold text-slate-800">
                        {formatPrice(lowestPrice)}
                      </td>

                      <td className="px-4 py-3.5">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold ${
                            show.status === "PUBLISHED"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {show.status}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedShow(show)}
                            className="grid size-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-100"
                          >
                            <Eye size={15} />
                          </button>

                          <button
                            onClick={() =>
                              reviewMutation.mutate({
                                id: show.id,
                                publish: show.status !== "PUBLISHED",
                              })
                            }
                            className={`rounded-lg border px-2.5 py-1 text-[10px] font-bold ${
                              show.status === "PUBLISHED"
                                ? "border-amber-200 text-amber-700 hover:bg-amber-50"
                                : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                            }`}
                          >
                            {show.status === "PUBLISHED" ? "Unpublish" : "Publish"}
                          </button>

                          <button
                            onClick={() => setDeleteItem(show)}
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
                  <td colSpan={6} className="px-5 py-14 text-center">
                    <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-red-50 text-[#E31824]">
                      <Mic size={22} />
                    </div>
                    <p className="mt-3 text-sm font-bold text-slate-800">No comedy shows found</p>
                    <p className="mt-1 text-xs text-slate-400">Add your first stand-up special or gig.</p>
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="mt-3 text-xs font-bold text-[#E31824] hover:underline"
                    >
                      + Add Comedy Show
                    </button>
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
              Page {page} of {data.pagination.pages}
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

      {/* Show Details Modal */}
      {selectedShow && (
        <Modal title={selectedShow.title} onClose={() => setSelectedShow(null)}>
          <div className="space-y-4 text-xs text-slate-600">
            {selectedShow.imageUrl && (
              <img src={selectedShow.imageUrl} alt="" className="h-44 w-full rounded-xl object-cover" />
            )}
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">About Show</p>
              <p className="mt-1 whitespace-pre-line leading-relaxed text-slate-700">{selectedShow.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="rounded-xl bg-slate-50 p-3">
                <span className="font-bold text-slate-500">Venue:</span>
                <p className="font-bold text-slate-800">{selectedShow.venue}, {selectedShow.city}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <span className="font-bold text-slate-500">Time:</span>
                <p className="font-bold text-slate-800">{new Date(selectedShow.startAt).toLocaleString("en-IN")}</p>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Add Comedy Show Modal */}
      {showAddModal && (
        <Modal title="Add Comedy Show" onClose={() => setShowAddModal(false)}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              createMutation.mutate();
            }}
            className="space-y-4 text-xs"
          >
            <div>
              <label className="block font-bold text-slate-700">Show Title</label>
              <input
                required
                type="text"
                value={newShow.title}
                onChange={(e) => setNewShow({ ...newShow, title: e.target.value })}
                placeholder="e.g. Unfiltered & Uncensored"
                className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 outline-none focus:border-[#E31824]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700">Comedian Name</label>
                <input
                  required
                  type="text"
                  value={newShow.comedian}
                  onChange={(e) => setNewShow({ ...newShow, comedian: e.target.value })}
                  placeholder="e.g. Zakir Khan, Vir Das"
                  className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 outline-none focus:border-[#E31824]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700">City</label>
                <input
                  required
                  type="text"
                  value={newShow.city}
                  onChange={(e) => setNewShow({ ...newShow, city: e.target.value })}
                  placeholder="e.g. Mumbai, Bangalore"
                  className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 outline-none focus:border-[#E31824]"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700">Venue</label>
              <input
                required
                type="text"
                value={newShow.venue}
                onChange={(e) => setNewShow({ ...newShow, venue: e.target.value })}
                placeholder="e.g. That Comedy Club, Bandra"
                className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 outline-none focus:border-[#E31824]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700">Date & Start Time</label>
                <input
                  required
                  type="datetime-local"
                  value={newShow.startAt}
                  onChange={(e) => setNewShow({ ...newShow, startAt: e.target.value })}
                  className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 outline-none focus:border-[#E31824]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700">End Time</label>
                <input
                  required
                  type="datetime-local"
                  value={newShow.endAt}
                  onChange={(e) => setNewShow({ ...newShow, endAt: e.target.value })}
                  className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 outline-none focus:border-[#E31824]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700">Ticket Price (INR)</label>
                <input
                  required
                  type="number"
                  min={0}
                  value={newShow.price}
                  onChange={(e) => setNewShow({ ...newShow, price: Number(e.target.value) })}
                  className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 outline-none focus:border-[#E31824]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700">Seating Capacity</label>
                <input
                  required
                  type="number"
                  min={1}
                  value={newShow.capacity}
                  onChange={(e) => setNewShow({ ...newShow, capacity: Number(e.target.value) })}
                  className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 outline-none focus:border-[#E31824]"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700">Poster Image URL</label>
              <input
                type="url"
                value={newShow.imageUrl}
                onChange={(e) => setNewShow({ ...newShow, imageUrl: e.target.value })}
                className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 outline-none focus:border-[#E31824]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 font-bold text-slate-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="rounded-xl bg-[#E31824] px-5 py-2 font-bold text-white shadow-md shadow-[#E31824]/20 hover:bg-[#c4141e] disabled:opacity-50"
              >
                {createMutation.isPending ? "Adding…" : "Publish Show"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation */}
      {deleteItem && (
        <Modal title="Delete Comedy Show?" onClose={() => setDeleteItem(null)}>
          <p className="text-sm text-slate-600">
            Are you sure you want to delete <strong>{deleteItem.title}</strong>?
          </p>
          <div className="mt-5 flex justify-end gap-2">
            <button
              onClick={() => setDeleteItem(null)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600"
            >
              Cancel
            </button>
            <button
              disabled={deleteMutation.isPending}
              onClick={() => deleteMutation.mutate(deleteItem.id)}
              className="rounded-xl bg-[#E31824] px-4 py-2 text-xs font-bold text-white hover:bg-[#c4141e]"
            >
              {deleteMutation.isPending ? "Deleting…" : "Delete"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
