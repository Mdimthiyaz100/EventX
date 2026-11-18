import { useState, useEffect } from "react";
import { QrCode, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import { organizerService } from "../../services/organizer.service";
import type { EventItem } from "../../types/content";

export default function TicketManagement() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [qrToken, setQrToken] = useState("");
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoadingEvents(true);
        const data = await organizerService.getMyEvents();
        setEvents(data || []);
        if (data && data.length > 0) {
          setSelectedEventId(data[0].id);
        }
      } catch (err: any) {
        setResult({ success: false, message: err.message || "Failed to load events." });
      } finally {
        setLoadingEvents(false);
      }
    }
    load();
  }, []);

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEventId || !qrToken.trim()) return;

    setVerifying(true);
    setResult(null);

    try {
      const res = await organizerService.checkInTicket(selectedEventId, qrToken.trim());
      setResult({
        success: true,
        message: res.message || "Ticket successfully validated and checked in!",
      });
      setQrToken("");
    } catch (err: any) {
      setResult({
        success: false,
        message: err.message || "Check-in failed. Ticket may be invalid or already used.",
      });
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold uppercase tracking-tight text-white">
          Ticket Check-In Terminal
        </h1>
        <p className="mt-1 text-xs text-white/50">
          Scan QR tokens or enter pass codes to check in attendees at venue gates.
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-[#121216] p-6 sm:p-8 space-y-6">
        <div>
          <label className="block text-xs font-bold uppercase text-white/60 mb-2">
            Select Active Event
          </label>
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            disabled={loadingEvents}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-semibold text-white outline-none focus:border-[#E31824]"
          >
            {events.map((ev) => (
              <option key={ev.id} value={ev.id} className="bg-[#121216]">
                {ev.title} ({ev.city})
              </option>
            ))}
          </select>
        </div>

        <form onSubmit={handleCheckIn} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-white/60 mb-2">
              QR Verification Token
            </label>
            <div className="relative">
              <QrCode size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                type="text"
                required
                value={qrToken}
                onChange={(e) => setQrToken(e.target.value)}
                placeholder="Paste or scan 32+ character QR token..."
                className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-xs font-mono text-white placeholder-white/30 outline-none focus:border-[#E31824]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={verifying || !qrToken.trim()}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#E31824] py-3 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-[#c8141f] disabled:opacity-50"
          >
            {verifying ? (
              <>
                <RefreshCw size={14} className="animate-spin" />
                <span>Verifying Ticket…</span>
              </>
            ) : (
              <span>Check-In Attendee</span>
            )}
          </button>
        </form>

        {result && (
          <div
            className={`flex items-start gap-3 rounded-2xl p-4 text-xs font-medium ${
              result.success
                ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                : "border border-red-500/20 bg-red-500/10 text-red-400"
            }`}
          >
            {result.success ? (
              <CheckCircle2 size={18} className="shrink-0 text-emerald-400 mt-0.5" />
            ) : (
              <AlertCircle size={18} className="shrink-0 text-red-400 mt-0.5" />
            )}
            <div>
              <p className="font-bold">{result.success ? "Check-in Successful" : "Check-in Error"}</p>
              <p className="mt-0.5 opacity-90">{result.message}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
