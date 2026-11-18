import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { organizerService } from "../../services/organizer.service";
import { eventService } from "../../services/event.service";

export default function EditOrganizerEvent() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    venue: "",
    city: "",
    address: "",
    startAt: "",
    endAt: "",
  });

  useEffect(() => {
    async function load() {
      if (!id) return;
      try {
        setLoading(true);
        const ev = await eventService.getEventById(id);
        if (ev) {
          setForm({
            title: ev.title || "",
            description: ev.description || "",
            category: ev.category || "",
            venue: ev.venue || "",
            city: ev.city || "",
            address: ev.location || "",
            startAt: ev.startAt ? new Date(ev.startAt).toISOString().slice(0, 16) : "",
            endAt: ev.endAt ? new Date(ev.endAt).toISOString().slice(0, 16) : "",
          });
        }
      } catch (err: any) {
        setError(err.message || "Failed to load event details.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setError("");
    setSubmitting(true);
    try {
      await organizerService.updateEvent(id, {
        ...form,
        startAt: new Date(form.startAt).toISOString(),
        endAt: form.endAt ? new Date(form.endAt).toISOString() : undefined,
      });
      navigate("/organizer/events");
    } catch (err: any) {
      setError(err.message || "Failed to update event.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-2 border-white/20 border-t-[#E31824]" />
      </div>
    );
  }

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
            Edit Event
          </h1>
          <p className="text-xs text-white/50">Modify event details, timing, or venue information.</p>
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
          <label className="block text-xs font-bold uppercase text-white/60">Event Title</label>
          <input
            type="text"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs text-white outline-none focus:border-[#E31824]"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-bold uppercase text-white/60">Category</label>
            <input
              type="text"
              required
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs text-white outline-none focus:border-[#E31824]"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-white/60">City</label>
            <input
              type="text"
              required
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs text-white outline-none focus:border-[#E31824]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase text-white/60">Venue Name</label>
          <input
            type="text"
            required
            value={form.venue}
            onChange={(e) => setForm({ ...form, venue: e.target.value })}
            className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs text-white outline-none focus:border-[#E31824]"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-bold uppercase text-white/60">Start Date & Time</label>
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
            className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 p-4 text-xs text-white outline-none focus:border-[#E31824]"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-[#E31824] py-3 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-[#c8141f] disabled:opacity-50"
        >
          {submitting ? "Saving Changes…" : "Update Event"}
        </button>
      </form>
    </div>
  );
}
