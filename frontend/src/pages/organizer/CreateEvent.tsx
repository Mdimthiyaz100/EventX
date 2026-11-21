import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, AlertCircle } from "lucide-react";
import { organizerService } from "../../services/organizer.service";

export default function CreateOrganizerEvent() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "Sports",
    venue: "",
    city: "Chennai",
    address: "",
    startAt: "",
    endAt: "",
    ticketTypes: [
      { name: "Standard Slot / Admission", price: 1500, capacity: 50 },
    ],
  });

  const addTicketType = () => {
    setForm((prev) => ({
      ...prev,
      ticketTypes: [...prev.ticketTypes, { name: "Prime / Weekend Slot", price: 2000, capacity: 50 }],
    }));
  };

  const removeTicketType = (index: number) => {
    if (form.ticketTypes.length <= 1) return;
    setForm((prev) => ({
      ...prev,
      ticketTypes: prev.ticketTypes.filter((_, i) => i !== index),
    }));
  };

  const updateTicketType = (index: number, field: string, val: string | number) => {
    setForm((prev) => {
      const updated = [...prev.ticketTypes];
      updated[index] = { ...updated[index], [field]: val };
      return { ...prev, ticketTypes: updated };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.title || !form.venue || !form.city || !form.startAt) {
      setError("Please complete all required fields.");
      return;
    }

    setSubmitting(true);
    try {
      await organizerService.createEvent({
        ...form,
        startAt: new Date(form.startAt).toISOString(),
        endAt: form.endAt ? new Date(form.endAt).toISOString() : undefined,
        ticketTypes: form.ticketTypes.map((t) => ({
          name: t.name,
          price: Number(t.price),
          capacity: Number(t.capacity),
        })),
      });
      navigate("/organizer/events");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create listing. Please check inputs.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 text-white">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/organizer/events"
          className="grid size-9 place-items-center rounded-xl border border-[#292929] bg-[#141414] text-[#A1A1AA] hover:text-white transition"
        >
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
            Add New Listing
          </h1>
          <p className="text-xs text-[#A1A1AA]">
            Submit a new sports turf facility, concert event, cinema screen or workshop to the approval pipeline.
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-xs font-semibold text-red-400">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-[#292929] bg-[#141414] p-6 sm:p-8">
        {/* Title */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#A1A1AA]">
            Facility / Listing Title *
          </label>
          <input
            type="text"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. Smash Sports Arena - FIFA Turf 7v7"
            className="mt-2 w-full rounded-xl border border-[#292929] bg-[#1A1A1A] px-4 py-2.5 text-xs text-white placeholder-[#777777] outline-none focus:border-[#F51D2B]"
          />
        </div>

        {/* Category & City */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#A1A1AA]">
              Organizer Category *
            </label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="mt-2 w-full rounded-xl border border-[#292929] bg-[#1A1A1A] px-4 py-2.5 text-xs text-white outline-none focus:border-[#F51D2B]"
            >
              <option value="Sports">Sports / Turf Facility</option>
              <option value="Cinema">Cinema & Screens</option>
              <option value="Concert">Concerts & Music</option>
              <option value="Comedy">Comedy Shows</option>
              <option value="Workshop">Workshop & Masterclass</option>
              <option value="General Events">General Events</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#A1A1AA]">
              Operating City *
            </label>
            <input
              type="text"
              required
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              placeholder="Chennai, Bengaluru, Mumbai..."
              className="mt-2 w-full rounded-xl border border-[#292929] bg-[#1A1A1A] px-4 py-2.5 text-xs text-white placeholder-[#777777] outline-none focus:border-[#F51D2B]"
            />
          </div>
        </div>

        {/* Venue & Location */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#A1A1AA]">
              Venue Name *
            </label>
            <input
              type="text"
              required
              value={form.venue}
              onChange={(e) => setForm({ ...form, venue: e.target.value })}
              placeholder="e.g. Velachery Main Road Turf Ground"
              className="mt-2 w-full rounded-xl border border-[#292929] bg-[#1A1A1A] px-4 py-2.5 text-xs text-white placeholder-[#777777] outline-none focus:border-[#F51D2B]"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#A1A1AA]">
              Full Address
            </label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="Door No, Street name, Landmark, Pincode"
              className="mt-2 w-full rounded-xl border border-[#292929] bg-[#1A1A1A] px-4 py-2.5 text-xs text-white placeholder-[#777777] outline-none focus:border-[#F51D2B]"
            />
          </div>
        </div>

        {/* Start & End Dates */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#A1A1AA]">
              Start Date & Time *
            </label>
            <input
              type="datetime-local"
              required
              value={form.startAt}
              onChange={(e) => setForm({ ...form, startAt: e.target.value })}
              className="mt-2 w-full rounded-xl border border-[#292929] bg-[#1A1A1A] px-4 py-2.5 text-xs text-white outline-none focus:border-[#F51D2B]"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#A1A1AA]">
              End Date & Time
            </label>
            <input
              type="datetime-local"
              value={form.endAt}
              onChange={(e) => setForm({ ...form, endAt: e.target.value })}
              className="mt-2 w-full rounded-xl border border-[#292929] bg-[#1A1A1A] px-4 py-2.5 text-xs text-white outline-none focus:border-[#F51D2B]"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#A1A1AA]">
            Description & Facility Features
          </label>
          <textarea
            rows={4}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Describe pitch specifications, floodlights, parking availability, seating options, etc."
            className="mt-2 w-full rounded-xl border border-[#292929] bg-[#1A1A1A] px-4 py-2.5 text-xs text-white placeholder-[#777777] outline-none focus:border-[#F51D2B]"
          />
        </div>

        {/* Pricing & Slot Categories */}
        <div className="border-t border-[#292929] pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                Ticket Types / Slot Categories
              </h3>
              <p className="text-[11px] text-[#A1A1AA]">
                Set slot prices and maximum attendee capacity per slot.
              </p>
            </div>
            <button
              type="button"
              onClick={addTicketType}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#292929] bg-[#1A1A1A] px-3 py-1.5 text-xs font-semibold text-white hover:border-[#3a3a3a] transition"
            >
              <Plus size={13} /> Add Slot Tier
            </button>
          </div>

          <div className="space-y-3">
            {form.ticketTypes.map((t, idx) => (
              <div
                key={idx}
                className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 rounded-xl border border-[#292929] bg-[#1A1A1A] p-3"
              >
                <div className="flex-1">
                  <input
                    type="text"
                    required
                    placeholder="Tier Name (e.g. Morning Slot, VIP Pass)"
                    value={t.name}
                    onChange={(e) => updateTicketType(idx, "name", e.target.value)}
                    className="w-full rounded-lg border border-[#292929] bg-[#141414] px-3 py-2 text-xs text-white outline-none focus:border-[#F51D2B]"
                  />
                </div>
                <div className="w-full sm:w-32">
                  <input
                    type="number"
                    required
                    min={0}
                    placeholder="Price (₹)"
                    value={t.price}
                    onChange={(e) => updateTicketType(idx, "price", Number(e.target.value))}
                    className="w-full rounded-lg border border-[#292929] bg-[#141414] px-3 py-2 text-xs text-white outline-none focus:border-[#F51D2B]"
                  />
                </div>
                <div className="w-full sm:w-28">
                  <input
                    type="number"
                    required
                    min={1}
                    placeholder="Capacity"
                    value={t.capacity}
                    onChange={(e) => updateTicketType(idx, "capacity", Number(e.target.value))}
                    className="w-full rounded-lg border border-[#292929] bg-[#141414] px-3 py-2 text-xs text-white outline-none focus:border-[#F51D2B]"
                  />
                </div>
                {form.ticketTypes.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeTicketType(idx)}
                    className="grid size-9 shrink-0 place-items-center rounded-lg text-red-400 hover:bg-red-500/10 transition"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex items-center justify-end gap-3 border-t border-[#292929] pt-6">
          <Link
            to="/organizer/events"
            className="rounded-xl border border-[#292929] bg-[#1A1A1A] px-5 py-2.5 text-xs font-semibold text-[#A1A1AA] hover:text-white transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-xl bg-[#F51D2B] px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-[#F51D2B]/20 hover:bg-[#ff2b39] transition disabled:opacity-50"
          >
            {submitting ? "Submitting to Approval..." : "Submit for Approval"}
          </button>
        </div>
      </form>
    </div>
  );
}
