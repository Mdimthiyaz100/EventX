import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Search,
  Trash2,
  Edit3,
  Layers,
  AlertCircle,
  Trophy,
  Film,
  Music,
  Laugh,
  BookOpen,
  Sparkles,
} from "lucide-react";
import { organizerService } from "../../services/organizer.service";
import type { EventItem } from "../../types/content";

export default function MyListings() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [deleteModalId, setDeleteModalId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const loadListings = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await organizerService.getMyEvents();
      setEvents(data || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load listings.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadListings();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await organizerService.deleteEvent(id);
      setActionMessage("Listing deleted or archived successfully.");
      setDeleteModalId(null);
      void loadListings();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to remove listing.";
      setError(msg);
    }
  };

  // Filter listings
  const filteredEvents = events.filter((ev) => {
    const matchesSearch =
      ev.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ev.venue.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ev.city.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "ALL" ? true : ev.status === statusFilter;
    const matchesCategory =
      categoryFilter === "ALL"
        ? true
        : ev.category?.toLowerCase() === categoryFilter.toLowerCase();
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getCategoryIcon = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes("sport") || cat.includes("turf")) return <Trophy size={13} className="text-[#F51D2B]" />;
    if (cat.includes("concert") || cat.includes("music")) return <Music size={13} className="text-[#F51D2B]" />;
    if (cat.includes("cinema") || cat.includes("theatre")) return <Film size={13} className="text-[#F51D2B]" />;
    if (cat.includes("comedy")) return <Laugh size={13} className="text-[#F51D2B]" />;
    if (cat.includes("workshop")) return <BookOpen size={13} className="text-[#F51D2B]" />;
    return <Sparkles size={13} className="text-[#F51D2B]" />;
  };

  return (
    <div className="space-y-6 text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
            My Listings & Facilities
          </h1>
          <p className="mt-1 text-xs text-[#A1A1AA]">
            Create, manage, and monitor the live status of all your entertainment and turf listings.
          </p>
        </div>
        <Link
          to="/organizer/events/create"
          className="inline-flex items-center gap-2 rounded-xl bg-[#F51D2B] px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-[#F51D2B]/20 transition hover:bg-[#ff2b39]"
        >
          <Plus size={16} />
          <span>Add New Listing</span>
        </Link>
      </div>

      {actionMessage && (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-xs font-semibold text-emerald-400">
          {actionMessage}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-xs font-semibold text-red-400">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 rounded-2xl border border-[#292929] bg-[#141414] p-3.5">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#777777]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search listings by title, turf name, city or venue..."
            className="w-full rounded-xl border border-[#292929] bg-[#1A1A1A] py-2 pl-10 pr-4 text-xs text-white placeholder-[#777777] outline-none focus:border-[#F51D2B]"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-[#292929] bg-[#1A1A1A] px-3 py-2 text-xs font-medium text-white outline-none focus:border-[#F51D2B]"
          >
            <option value="ALL">All Statuses</option>
            <option value="PUBLISHED">Approved (Live)</option>
            <option value="DRAFT">Pending Approval</option>
            <option value="CANCELLED">Archived</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-xl border border-[#292929] bg-[#1A1A1A] px-3 py-2 text-xs font-medium text-white outline-none focus:border-[#F51D2B]"
          >
            <option value="ALL">All Categories</option>
            <option value="sports">Sports / Turf</option>
            <option value="concert">Concert</option>
            <option value="cinema">Cinema</option>
            <option value="comedy">Comedy</option>
            <option value="workshop">Workshop</option>
            <option value="general">General Events</option>
          </select>
        </div>
      </div>

      {/* Listings Table / Cards */}
      {loading ? (
        <div className="flex min-h-[300px] items-center justify-center">
          <div className="size-8 animate-spin rounded-full border-2 border-white/20 border-t-[#F51D2B]" />
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="rounded-2xl border border-[#292929] bg-[#141414] p-12 text-center">
          <Layers size={40} className="mx-auto text-[#777777]" />
          <h3 className="mt-4 text-base font-bold text-white">No listings found</h3>
          <p className="mt-1 text-xs text-[#A1A1AA]">
            {searchTerm || statusFilter !== "ALL"
              ? "Try adjusting your search criteria or filters."
              : "You haven't submitted any listings yet. Create your first facility or event."}
          </p>
          <Link
            to="/organizer/events/create"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#F51D2B] px-4 py-2 text-xs font-bold text-white"
          >
            <Plus size={14} />
            <span>Create New Listing</span>
          </Link>
        </div>
      ) : (
        <div className="rounded-2xl border border-[#292929] bg-[#141414] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#292929] bg-[#1A1A1A]/60 text-[11px] font-semibold text-[#777777]">
                  <th className="py-3.5 pl-5">Listing Details</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Venue & City</th>
                  <th className="py-3.5 px-4">Approval Status</th>
                  <th className="py-3.5 px-4">Pricing</th>
                  <th className="py-3.5 pr-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222222]">
                {filteredEvents.map((item) => {
                  const isApproved = item.status === "PUBLISHED";
                  const isDraft = item.status === "DRAFT";
                  const startPrice =
                    item.ticketTypes && item.ticketTypes.length > 0
                      ? Math.min(...item.ticketTypes.map((t) => Number(t.price)))
                      : 0;

                  return (
                    <tr key={item.id} className="hover:bg-[#1A1A1A]/40 transition">
                      <td className="py-4 pl-5">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              item.imageUrl ||
                              "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=300&q=80"
                            }
                            alt={item.title}
                            className="size-12 rounded-xl object-cover border border-[#292929] bg-[#1E1E1E]"
                          />
                          <div>
                            <p className="font-bold text-white">{item.title}</p>
                            <p className="text-[11px] text-[#777777] line-clamp-1 max-w-xs">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="inline-flex items-center gap-1.5 rounded-lg border border-[#292929] bg-[#1A1A1A] px-2.5 py-1 text-[11px] font-medium text-white">
                          {getCategoryIcon(item.category)}
                          <span>{item.category}</span>
                        </div>
                      </td>

                      <td className="py-4 px-4 text-[#A1A1AA]">
                        <p className="text-white font-medium">{item.venue}</p>
                        <p className="text-[11px] text-[#777777]">{item.city}</p>
                      </td>

                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                            isApproved
                              ? "bg-emerald-500/10 text-emerald-400"
                              : isDraft
                              ? "bg-amber-500/10 text-amber-400"
                              : "bg-red-500/10 text-red-400"
                          }`}
                        >
                          {isApproved ? "Approved" : isDraft ? "Pending Review" : "Archived"}
                        </span>
                      </td>

                      <td className="py-4 px-4 font-bold text-white">
                        ₹{startPrice.toLocaleString("en-IN")}
                        <span className="text-[10px] font-normal text-[#777777] ml-1">starting</span>
                      </td>

                      <td className="py-4 pr-5 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <Link
                            to={`/organizer/events/${item.id}/edit`}
                            title="Edit Listing"
                            className="grid size-8 place-items-center rounded-lg border border-[#292929] bg-[#1A1A1A] text-[#A1A1AA] transition hover:border-[#3a3a3a] hover:text-white"
                          >
                            <Edit3 size={13} />
                          </Link>
                          <button
                            onClick={() => setDeleteModalId(item.id)}
                            title="Delete / Archive Listing"
                            className="grid size-8 place-items-center rounded-lg border border-[#292929] bg-[#1A1A1A] text-red-400 transition hover:bg-red-500/10"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-[#292929] bg-[#141414] p-6 text-center">
            <div className="mx-auto grid size-12 place-items-center rounded-full bg-red-500/10 text-[#F51D2B]">
              <Trash2 size={20} />
            </div>
            <h3 className="mt-4 text-base font-bold text-white">Delete or Archive Listing?</h3>
            <p className="mt-2 text-xs text-[#A1A1AA]">
              Are you sure you want to remove this listing? Approved listings will be archived.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <button
                onClick={() => setDeleteModalId(null)}
                className="flex-1 rounded-xl border border-[#292929] bg-[#1A1A1A] py-2.5 text-xs font-semibold text-[#A1A1AA] hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteModalId)}
                className="flex-1 rounded-xl bg-[#F51D2B] py-2.5 text-xs font-bold text-white hover:bg-[#ff2b39]"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
