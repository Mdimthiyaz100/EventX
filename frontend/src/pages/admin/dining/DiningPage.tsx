import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Eye,
  Plus,
  Search,
  Trash2,
  Utensils,
  X,
  Clock,
  Sparkles,
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

export default function DiningPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedPartner, setSelectedPartner] = useState<AdminEvent | null>(null);
  const [deleteItem, setDeleteItem] = useState<AdminEvent | null>(null);
  const [feedback, setFeedback] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  // New Restaurant State
  const [restaurant, setRestaurant] = useState({
    name: "",
    cuisine: "Continental & Pan-Asian",
    description: "Multi-course chef curated dining experience with premium pairings.",
    diningCategory: "Fine Dining",
    city: "Mumbai",
    venue: "Bandra West, Linking Road",
    imageUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80",
    coverPrice: 1500,
    tableCapacity: 60,
  });

  const params = useMemo(
    () => ({
      page,
      limit: 10,
      search: search || undefined,
      category: "Dining",
    }),
    [page, search],
  );

  const { data, isLoading } = useQuery({
    queryKey: ["admin-dining", params],
    queryFn: () => listAdminEvents(params),
  });

  const createMutation = useMutation({
    mutationFn: () => {
      const now = new Date();
      const nextMonth = new Date(now.getTime() + 86400000 * 30);
      return createAdminEvent({
        title: restaurant.name,
        description: `Cuisine: ${restaurant.cuisine} (${restaurant.diningCategory})\n\nMenu Highlights:\n${restaurant.description}`,
        category: "Dining",
        city: restaurant.city,
        venue: restaurant.venue,
        imageUrl: restaurant.imageUrl,
        startAt: now.toISOString(),
        endAt: nextMonth.toISOString(),
        ticketTypes: [
          { name: "Table Reservation for 2", price: restaurant.coverPrice, capacity: Math.floor(restaurant.tableCapacity / 2) },
          { name: "Chef's Tasting Menu (per guest)", price: restaurant.coverPrice * 1.5, capacity: 20 },
        ],
        status: "PUBLISHED",
      });
    },
    onSuccess: () => {
      setShowAddModal(false);
      setFeedback("Dining partner added successfully!");
      void queryClient.invalidateQueries({ queryKey: ["admin-dining"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-events"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
    },
    onError: (err) => {
      setFeedback(err instanceof Error ? err.message : "Failed to add dining partner.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAdminEvent(id),
    onSuccess: () => {
      setDeleteItem(null);
      setFeedback("Dining partner removed.");
      void queryClient.invalidateQueries({ queryKey: ["admin-dining"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
    },
  });

  const reviewMutation = useMutation({
    mutationFn: ({ id, publish }: { id: string; publish: boolean }) =>
      reviewAdminEvent(id, publish),
    onSuccess: () => {
      setFeedback("Dining status updated.");
      void queryClient.invalidateQueries({ queryKey: ["admin-dining"] });
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
            GOURMET & HOSPITALITY
          </p>
          <h1 className="mt-1 font-display text-4xl font-extrabold uppercase tracking-tight text-slate-900">
            Dining Partners
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Manage partner restaurants, chef menus, table reservations, and culinary experiences.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#E31824] px-5 text-xs font-bold text-white shadow-lg shadow-[#E31824]/20 transition hover:bg-[#c4141e]"
        >
          <Plus size={16} />
          <span>Add Dining Partner</span>
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

      {/* Filter & Table */}
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
              placeholder="Search restaurants by name or city..."
              className="h-10 w-full rounded-xl border border-slate-200 bg-[#FCF9F4] pl-9 pr-4 text-xs font-medium text-slate-800 outline-none focus:border-[#E31824] focus:bg-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left">
            <thead>
              <tr className="bg-slate-50/75 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                <th className="px-5 py-3.5">Restaurant & Cuisine</th>
                <th className="px-4 py-3.5">Location</th>
                <th className="px-4 py-3.5">Reservations</th>
                <th className="px-4 py-3.5">Average Cover</th>
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
                data.events.map((partner) => {
                  const lowestPrice =
                    partner.ticketTypes && partner.ticketTypes.length > 0
                      ? Math.min(...partner.ticketTypes.map((t) => Number(t.price)))
                      : 1200;

                  return (
                    <tr
                      key={partner.id}
                      className="border-t border-slate-100 text-xs transition-colors hover:bg-slate-50/60"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-xl bg-orange-50 text-orange-600">
                            {partner.imageUrl ? (
                              <img src={partner.imageUrl} alt="" className="size-full object-cover" />
                            ) : (
                              <Utensils size={18} />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="max-w-[240px] truncate font-bold text-slate-800">
                              {partner.title}
                            </p>
                            <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                              <Sparkles size={11} className="text-amber-500" /> Premium Dining
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 text-slate-700">
                        <p className="font-semibold">{partner.venue}</p>
                        <p className="text-[11px] text-slate-400">{partner.city}</p>
                      </td>

                      <td className="px-4 py-3.5 text-slate-600 font-medium">
                        <span className="inline-flex items-center gap-1">
                          <Clock size={12} className="text-slate-400" /> Daily Open
                        </span>
                        <p className="text-[11px] text-slate-400">
                          {partner._count?.bookings || 0} reservation(s)
                        </p>
                      </td>

                      <td className="px-4 py-3.5 font-bold text-slate-800">
                        {formatPrice(lowestPrice)}
                      </td>

                      <td className="px-4 py-3.5">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold ${
                            partner.status === "PUBLISHED"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {partner.status}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedPartner(partner)}
                            className="grid size-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-100"
                          >
                            <Eye size={15} />
                          </button>

                          <button
                            onClick={() =>
                              reviewMutation.mutate({
                                id: partner.id,
                                publish: partner.status !== "PUBLISHED",
                              })
                            }
                            className={`rounded-lg border px-2.5 py-1 text-[10px] font-bold ${
                              partner.status === "PUBLISHED"
                                ? "border-amber-200 text-amber-700 hover:bg-amber-50"
                                : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                            }`}
                          >
                            {partner.status === "PUBLISHED" ? "Unpublish" : "Publish"}
                          </button>

                          <button
                            onClick={() => setDeleteItem(partner)}
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
                    <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-orange-50 text-orange-600">
                      <Utensils size={22} />
                    </div>
                    <p className="mt-3 text-sm font-bold text-slate-800">No dining partners listed</p>
                    <p className="mt-1 text-xs text-slate-400">Add top-tier restaurants and culinary experiences.</p>
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="mt-3 text-xs font-bold text-[#E31824] hover:underline"
                    >
                      + Add Dining Partner
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

      {/* Selected Partner Modal */}
      {selectedPartner && (
        <Modal title={selectedPartner.title} onClose={() => setSelectedPartner(null)}>
          <div className="space-y-4 text-xs text-slate-600">
            {selectedPartner.imageUrl && (
              <img src={selectedPartner.imageUrl} alt="" className="h-44 w-full rounded-xl object-cover" />
            )}
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">About Experience</p>
              <p className="mt-1 whitespace-pre-line leading-relaxed text-slate-700">{selectedPartner.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="rounded-xl bg-slate-50 p-3">
                <span className="font-bold text-slate-500">Location:</span>
                <p className="font-bold text-slate-800">{selectedPartner.venue}, {selectedPartner.city}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <span className="font-bold text-slate-500">Reservations:</span>
                <p className="font-bold text-slate-800">{selectedPartner._count?.bookings || 0} active</p>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Add Partner Modal */}
      {showAddModal && (
        <Modal title="Add Dining Partner" onClose={() => setShowAddModal(false)}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              createMutation.mutate();
            }}
            className="space-y-4 text-xs"
          >
            <div>
              <label className="block font-bold text-slate-700">Restaurant Name *</label>
              <input
                required
                type="text"
                value={restaurant.name}
                onChange={(e) => setRestaurant({ ...restaurant, name: e.target.value })}
                placeholder="e.g. Bastian, Mumbai"
                className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 outline-none focus:border-[#E31824]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700">Cuisine Style</label>
                <input
                  required
                  type="text"
                  value={restaurant.cuisine}
                  onChange={(e) => setRestaurant({ ...restaurant, cuisine: e.target.value })}
                  placeholder="e.g. Modern European, Pan-Asian"
                  className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 outline-none focus:border-[#E31824]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700">Dining Category</label>
                <select
                  value={restaurant.diningCategory}
                  onChange={(e) => setRestaurant({ ...restaurant, diningCategory: e.target.value })}
                  className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 outline-none focus:border-[#E31824]"
                >
                  <option value="Fine Dining">Fine Dining</option>
                  <option value="Rooftop Lounge">Rooftop Lounge</option>
                  <option value="Bistro & Cafe">Bistro & Cafe</option>
                  <option value="Chef Table">Chef Table</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700">City</label>
                <input
                  required
                  type="text"
                  value={restaurant.city}
                  onChange={(e) => setRestaurant({ ...restaurant, city: e.target.value })}
                  placeholder="e.g. Mumbai, New Delhi"
                  className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 outline-none focus:border-[#E31824]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700">Address / Location</label>
                <input
                  required
                  type="text"
                  value={restaurant.venue}
                  onChange={(e) => setRestaurant({ ...restaurant, venue: e.target.value })}
                  placeholder="e.g. Bandra West"
                  className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 outline-none focus:border-[#E31824]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700">Cover / Reservation Deposit (INR)</label>
                <input
                  required
                  type="number"
                  min={0}
                  value={restaurant.coverPrice}
                  onChange={(e) => setRestaurant({ ...restaurant, coverPrice: Number(e.target.value) })}
                  className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 outline-none focus:border-[#E31824]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700">Total Seating Capacity</label>
                <input
                  required
                  type="number"
                  min={1}
                  value={restaurant.tableCapacity}
                  onChange={(e) => setRestaurant({ ...restaurant, tableCapacity: Number(e.target.value) })}
                  className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 outline-none focus:border-[#E31824]"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700">Menu Highlights / Description</label>
              <textarea
                rows={3}
                value={restaurant.description}
                onChange={(e) => setRestaurant({ ...restaurant, description: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-[#E31824]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700">Restaurant Image URL</label>
              <input
                type="url"
                value={restaurant.imageUrl}
                onChange={(e) => setRestaurant({ ...restaurant, imageUrl: e.target.value })}
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
                {createMutation.isPending ? "Adding…" : "Add Partner"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Modal */}
      {deleteItem && (
        <Modal title="Delete Dining Partner?" onClose={() => setDeleteItem(null)}>
          <p className="text-sm text-slate-600">
            Are you sure you want to remove <strong>{deleteItem.title}</strong>?
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
