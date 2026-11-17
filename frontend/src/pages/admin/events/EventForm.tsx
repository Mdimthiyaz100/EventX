import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  LoaderCircle,
  Plus,
  Save,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { uploadMovieImage } from "../../../services/movieService";
import {
  createAdminEvent,
  getAdminEvent,
  updateAdminEvent,
  type EventInput,
} from "../../../services/adminService";

const defaultEvent: EventInput = {
  title: "",
  description: "",
  category: "Music",
  city: "Mumbai",
  venue: "",
  imageUrl: "",
  startAt: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
  endAt: new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 16),
  status: "PUBLISHED",
  featured: false,
  ticketTypes: [
    { name: "General Admission", price: 999, capacity: 500 },
    { name: "VIP Pass", price: 2499, capacity: 100 },
  ],
};

export default function EventForm() {
  const { id } = useParams();
  const editing = Boolean(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [form, setForm] = useState<EventInput>(defaultEvent);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch event details if editing
  const eventQuery = useQuery({
    queryKey: ["admin-event", id],
    queryFn: () => getAdminEvent(id!),
    enabled: editing,
  });

  useEffect(() => {
    if (eventQuery.data) {
      const e = eventQuery.data;
      setForm({
        title: e.title,
        description: e.description,
        category: e.category,
        city: e.city,
        venue: e.venue,
        imageUrl: e.imageUrl || "",
        startAt: new Date(e.startAt).toISOString().slice(0, 16),
        endAt: new Date(e.endAt).toISOString().slice(0, 16),
        status: e.status === "CANCELLED" ? "DRAFT" : e.status,
        featured: e.featured,
        ticketTypes:
          e.ticketTypes && e.ticketTypes.length > 0
            ? e.ticketTypes.map((t) => ({
                name: t.name,
                price: Number(t.price),
                capacity: t.capacity,
              }))
            : defaultEvent.ticketTypes,
      });
    }
  }, [eventQuery.data]);

  const saveMutation = useMutation({
    mutationFn: () => {
      const payload = {
        ...form,
        startAt: new Date(form.startAt).toISOString(),
        endAt: new Date(form.endAt).toISOString(),
        imageUrl: form.imageUrl || undefined,
      };
      return editing && id ? updateAdminEvent(id, payload) : createAdminEvent(payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-events"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
      navigate("/admin/events");
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : "Failed to save event.");
    },
  });

  // Ticket tier helpers
  const addTier = () => {
    setForm((curr) => ({
      ...curr,
      ticketTypes: [...curr.ticketTypes, { name: "Tier", price: 500, capacity: 50 }],
    }));
  };

  const removeTier = (index: number) => {
    setForm((curr) => ({
      ...curr,
      ticketTypes: curr.ticketTypes.filter((_, i) => i !== index),
    }));
  };

  const updateTier = (index: number, field: string, val: string | number) => {
    setForm((curr) => ({
      ...curr,
      ticketTypes: curr.ticketTypes.map((tier, i) =>
        i === index ? { ...tier, [field]: val } : tier,
      ),
    }));
  };

  // Image Upload Handler via Cloudinary
  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError("");
    if (!file.type.startsWith("image/")) {
      setError("Please select a JPEG, PNG, or WebP image.");
      return;
    }
    setUploading(true);
    try {
      const res = await uploadMovieImage(file, "banner");
      setForm((curr) => ({ ...curr, imageUrl: res.url }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload image.");
    } finally {
      setUploading(false);
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (new Date(form.endAt) <= new Date(form.startAt)) {
      setError("Event end time must be after its start time.");
      return;
    }

    if (form.ticketTypes.length === 0) {
      setError("Add at least one ticket tier.");
      return;
    }

    try {
      await saveMutation.mutateAsync();
    } catch {
      // Handled by mutation onError
    }
  };

  if (editing && eventQuery.isLoading) {
    return <div className="h-[400px] w-full animate-pulse rounded-2xl bg-slate-100" />;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Top Breadcrumb */}
      <div>
        <Link
          to="/admin/events"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-[#E31824]"
        >
          <ArrowLeft size={14} /> Back to Events
        </Link>
        <div className="mt-3 flex items-end justify-between">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[.25em] text-[#E31824]">
              CATALOG BUILDER
            </p>
            <h1 className="mt-1 font-display text-4xl font-extrabold uppercase tracking-tight text-slate-900">
              {editing ? "Edit Event" : "Create New Event"}
            </h1>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-800">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Basic Information */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-base font-extrabold text-slate-900">1. Basic Information</h2>
          <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700">Event Title *</label>
              <input
                required
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Ota TOKYO 2026 | Live Concert"
                className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3.5 text-xs outline-none focus:border-[#E31824]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700">Category *</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-xs outline-none focus:border-[#E31824]"
              >
                <option value="Music">Music</option>
                <option value="Concert">Concert</option>
                <option value="Comedy">Comedy</option>
                <option value="Tech">Tech</option>
                <option value="Food">Food</option>
                <option value="Sports">Sports</option>
                <option value="Theatre">Theatre</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700">City *</label>
              <input
                required
                type="text"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                placeholder="e.g. Mumbai, Delhi, Bengaluru"
                className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3.5 text-xs outline-none focus:border-[#E31824]"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700">Venue Address *</label>
              <input
                required
                type="text"
                value={form.venue}
                onChange={(e) => setForm({ ...form, venue: e.target.value })}
                placeholder="e.g. Jio World Garden, BKC"
                className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3.5 text-xs outline-none focus:border-[#E31824]"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700">Description *</label>
              <textarea
                required
                rows={4}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Describe this experience, artist lineup, schedule highlights..."
                className="mt-1.5 w-full rounded-xl border border-slate-200 p-3.5 text-xs outline-none focus:border-[#E31824]"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Date, Time & Publication */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-base font-extrabold text-slate-900">2. Schedule & Visibility</h2>
          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-slate-700">Start Date & Time *</label>
              <input
                required
                type="datetime-local"
                value={form.startAt}
                onChange={(e) => setForm({ ...form, startAt: e.target.value })}
                className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3.5 text-xs outline-none focus:border-[#E31824]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700">End Date & Time *</label>
              <input
                required
                type="datetime-local"
                value={form.endAt}
                onChange={(e) => setForm({ ...form, endAt: e.target.value })}
                className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3.5 text-xs outline-none focus:border-[#E31824]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700">Publication Status</label>
              <select
                value={form.status}
                onChange={(e) =>
                  setForm({ ...form, status: e.target.value as "DRAFT" | "PUBLISHED" })
                }
                className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-xs outline-none focus:border-[#E31824]"
              >
                <option value="PUBLISHED">Published (Visible to public)</option>
                <option value="DRAFT">Draft (Hidden)</option>
              </select>
            </div>

            <div className="flex items-center gap-3 pt-6">
              <input
                type="checkbox"
                id="featured-event"
                checked={form.featured}
                onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                className="size-4 rounded text-[#E31824] focus:ring-[#E31824]"
              />
              <label htmlFor="featured-event" className="cursor-pointer text-xs font-bold text-slate-700">
                Feature on EventX Homepage
              </label>
            </div>
          </div>
        </div>

        {/* Section 3: Event Artwork / Poster */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-base font-extrabold text-slate-900">3. Event Artwork & Poster</h2>
          <p className="mt-1 text-xs text-slate-400">
            Upload an image or provide a secure public URL.
          </p>

          <div className="mt-4 flex flex-col gap-4 sm:flex-row">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={(e) => void handleFile(e.target.files?.[0])}
            />

            <div className="flex-1">
              <input
                type="url"
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                placeholder="https://images.unsplash.com/photo-..."
                className="h-11 w-full rounded-xl border border-slate-200 px-3.5 text-xs outline-none focus:border-[#E31824]"
              />
            </div>

            <button
              type="button"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
            >
              {uploading ? <LoaderCircle size={15} className="animate-spin text-[#E31824]" /> : <UploadCloud size={16} />}
              <span>{uploading ? "Uploading…" : "Upload to Cloud"}</span>
            </button>
          </div>

          {form.imageUrl && (
            <div className="mt-4 relative h-48 w-full overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
              <img src={form.imageUrl} alt="Event preview" className="size-full object-cover" />
              <button
                type="button"
                onClick={() => setForm({ ...form, imageUrl: "" })}
                className="absolute right-2 top-2 grid size-7 place-items-center rounded-full bg-black/60 text-white hover:bg-black"
              >
                <X size={14} />
              </button>
            </div>
          )}
        </div>

        {/* Section 4: Ticket Tiers & Pricing */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">4. Ticket Tiers & Capacity</h2>
              <p className="mt-0.5 text-xs text-slate-400">
                Define the ticket pricing and available seats for this event.
              </p>
            </div>
            <button
              type="button"
              onClick={addTier}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              <Plus size={14} /> Add Tier
            </button>
          </div>

          <div className="mt-5 space-y-3">
            {form.ticketTypes.map((tier, index) => (
              <div
                key={index}
                className="grid grid-cols-1 items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3 sm:grid-cols-4"
              >
                <div className="sm:col-span-2">
                  <label className="text-[10px] font-bold text-slate-400">Tier Name</label>
                  <input
                    type="text"
                    required
                    value={tier.name}
                    onChange={(e) => updateTier(index, "name", e.target.value)}
                    placeholder="e.g. VIP, General"
                    className="mt-1 h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400">Price (INR)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={tier.price}
                    onChange={(e) => updateTier(index, "price", Number(e.target.value))}
                    className="mt-1 h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs outline-none"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <label className="text-[10px] font-bold text-slate-400">Capacity</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={tier.capacity}
                      onChange={(e) => updateTier(index, "capacity", Number(e.target.value))}
                      className="mt-1 h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs outline-none"
                    />
                  </div>

                  {form.ticketTypes.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTier(index)}
                      className="mt-4 grid size-9 shrink-0 place-items-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-2">
          <Link
            to="/admin/events"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-xs font-bold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={saveMutation.isPending || uploading}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#E31824] px-6 text-xs font-bold text-white shadow-lg shadow-[#E31824]/20 hover:bg-[#c4141e] disabled:opacity-50"
          >
            {saveMutation.isPending ? (
              <LoaderCircle size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            <span>{editing ? "Save Changes" : "Publish Event"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
