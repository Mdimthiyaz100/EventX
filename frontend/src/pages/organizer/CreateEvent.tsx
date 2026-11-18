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
    category: "Comedy",
    venue: "",
    city: "Chennai",
    address: "",
    startAt: "",
    endAt: "",
    ticketTypes: [
      { name: "General Admission", price: 499, capacity: 100 },
    ],
  });

  const addTicketType = () => {
    setForm((prev) => ({
      ...prev,
      ticketTypes: [...prev.ticketTypes, { name: "VIP Pass", price: 999, capacity: 50 }],
    }));
  };

  const removeTicketType = (index: number) => {
    if (form.ticketTypes.length <= 1) return;
    setForm((prev) => ({
      ...prev,
      ticketTypes: prev.ticketTypes.filter((_, i) => i !== index),
    }));
  };

  const updateTicketType = (index: number, field: string, val: any) => {
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
    } catch (err: any) {
      setError(err.message || "Failed to create event. Please check inputs.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Link
          to="/organizer/events"
          className="grid size-9 place-items-center rounded-xl border border-white/10 bg-white/5 text-white/60 hover:text-white"
        >
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="font-display text-2xl font-bold uppercase tracking-tight text-white">
            Create New Event
          </h1>
          <p className="text-xs text-white/50">
            Submit a new event listing and ticket inventory.
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-xs font-semibold text-red-400">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-white/10 bg-[#121216] p-6 sm:p-8">
        <div>
          <label className="block text-xs font-bold uppercase text-white/60">Event Title *</label>
          <input
            type="text"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. Chennai Indie Music Night"
            className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs text-white placeholder-white/30 outline-none focus:border-[#E31824]"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-bold uppercase text-white/60">Category *</label>
            <input
              type="text"
              required
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              placeholder="Comedy, Concert, Workshop..."
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs text-white placeholder-white/30 outline-none focus:border-[#E31824]"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-white/60">City *</label>
            <input
              type="text"
              required
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              placeholder="Chennai, Bengaluru, Mumbai..."
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs text-white placeholder-white/30 outline-none focus:border-[#E31824]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase text-white/60">Venue Name *</label>
          <input
            type="text"
            required
            value={form.venue}
            onChange={(e) => setForm({ ...form, venue: e.target.value })}
            placeholder="e.g. Music Academy Auditorium"
            className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs text-white placeholder-white/30 outline-none focus:border-[#E31824]"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-bold uppercase text-white/60">Start Date & Time *</label>
            <input
              type="datetime-local"
              required
              value={form.startAt}
              onChange={(e) => setForm({ ...form, startAt: e.target.value })}
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs text-white outline-none focus:border-[#E31824]"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-white/60">End Date & Time</label>
            <input
              type="datetime-local"
              value={form.endAt}
              onChange={(e) => setForm({ ...form, endAt: e.target.value })}
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs text-white outline-none focus:border-[#E31824]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase text-white/60">Description</label>
          <textarea
            rows={4}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Detailed description of the event, artist line-up, and entry guidelines..."
            className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 p-4 text-xs text-white placeholder-white/30 outline-none focus:border-[#E31824]"
          />
        </div>

        {/* Ticket Types */}
        <div className="border-t border-white/10 pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">Ticket Tiers</h3>
            <button
              type="button"
              onClick={addTicketType}
              className="flex items-center gap-1 text-xs font-bold text-[#E31824] hover:underline"
            >
              <Plus size={14} /> Add Tier
            </button>
          </div>

          <div className="space-y-3">
            {form.ticketTypes.map((tier, idx) => (
              <div key={idx} className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3">
                <input
                  type="text"
                  required
                  placeholder="Tier Name (e.g. Silver)"
                  value={tier.name}
                  onChange={(e) => updateTicketType(idx, "name", e.target.value)}
                  className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white outline-none"
                />
                <input
                  type="number"
                  required
                  min={0}
                  placeholder="Price (₹)"
                  value={tier.price}
                  onChange={(e) => updateTicketType(idx, "price", e.target.value)}
                  className="w-24 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white outline-none"
                />
                <input
                  type="number"
                  required
                  min={1}
                  placeholder="Capacity"
                  value={tier.capacity}
                  onChange={(e) => updateTicketType(idx, "capacity", e.target.value)}
                  className="w-24 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white outline-none"
                />
                {form.ticketTypes.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeTicketType(idx)}
                    className="p-1 text-white/40 hover:text-red-400"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-[#E31824] py-3 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-[#c8141f] disabled:opacity-50"
        >
          {submitting ? "Submitting Event…" : "Publish Event"}
        </button>
      </form>
    </div>
  );
}
