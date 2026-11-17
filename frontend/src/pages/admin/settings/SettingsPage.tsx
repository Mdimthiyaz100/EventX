import { useMutation, useQuery } from "@tanstack/react-query";
import { Check, Save, ShieldCheck } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { apiRequest } from "../../../services/api";
import { useAuth } from "../../../context/AuthContext";

export default function SettingsPage() {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  const { data: profile, isLoading } = useQuery({
    queryKey: ["auth-me"],
    queryFn: () => apiRequest<{ name: string; email: string; phone?: string | null }>("GET", "/auth/me"),
  });

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setPhone(profile.phone || "");
    } else if (user) {
      setName(user.name);
    }
  }, [profile, user]);

  const saveMutation = useMutation({
    mutationFn: () =>
      apiRequest("PATCH", "/auth/me", {
        name,
        phone: phone || null,
      }),
    onSuccess: () => {
      setFeedback("Admin profile updated successfully.");
      setError("");
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : "Failed to save profile.");
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setFeedback("");
    setError("");
    saveMutation.mutate();
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Page Header */}
      <div>
        <p className="text-[11px] font-extrabold uppercase tracking-[.25em] text-[#E31824]">
          SYSTEM CONFIGURATION
        </p>
        <h1 className="mt-1 font-display text-4xl font-extrabold uppercase tracking-tight text-slate-900">
          Admin Portal Settings
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          Update your administrator identity and security preferences.
        </p>
      </div>

      {feedback && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-800">
          <Check size={16} />
          <span>{feedback}</span>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-800">
          {error}
        </div>
      )}

      {/* Profile Form */}
      <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-xl bg-red-50 text-[#E31824]">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900">Administrator Credentials</h2>
            <p className="text-xs text-slate-400">
              Identity details displayed in the admin workspace header and audit logs.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700">Full Name</label>
            <input
              required
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3.5 text-xs outline-none focus:border-[#E31824]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700">Email Address (Read-only)</label>
            <input
              disabled
              type="email"
              value={profile?.email || user?.email || "admin@eventx.com"}
              className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-xs text-slate-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700">Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3.5 text-xs outline-none focus:border-[#E31824]"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={saveMutation.isPending || isLoading}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#E31824] px-6 text-xs font-bold text-white shadow-lg shadow-[#E31824]/20 hover:bg-[#c4141e] disabled:opacity-50"
            >
              <Save size={15} />
              <span>{saveMutation.isPending ? "Saving…" : "Save Changes"}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
