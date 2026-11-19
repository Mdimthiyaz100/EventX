import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { User, Mail, Phone, ShieldCheck, CheckCircle2, AlertCircle, KeyRound, ChevronRight } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { userService, type UserProfile } from "../../services/user.service";

export default function CustomerProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    async function load() {
      if (!user) return;
      try {
        setLoading(true);
        const data = await userService.getProfile();
        setProfile(data);
        setName(data.name || "");
        setPhone(data.phone || "");
      } catch (err: any) {
        setMessage({ type: "error", text: err.message || "Failed to load profile." });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const updated = await userService.updateProfile({ name, phone });
      setProfile(updated);
      setMessage({ type: "success", text: "Profile updated successfully!" });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to update profile." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="rounded-3xl border border-white/10 bg-[#121216] p-8 shadow-xl">
        <div className="flex items-center gap-4 border-b border-white/10 pb-6">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-[#E31824]/10 text-[#E31824]">
            <User size={28} />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold uppercase tracking-tight text-white">
              My Profile
            </h1>
            <p className="mt-0.5 text-xs text-white/50">
              Manage your personal information and contact preferences.
            </p>
          </div>
        </div>

        {message && (
          <div
            className={`mt-6 flex items-center gap-3 rounded-2xl p-4 text-xs font-semibold ${
              message.type === "success"
                ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                : "border border-red-500/20 bg-red-500/10 text-red-400"
            }`}
          >
            {message.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{message.text}</span>
          </div>
        )}

        {loading ? (
          <div className="flex min-h-[30vh] items-center justify-center">
            <div className="size-8 animate-spin rounded-full border-2 border-white/20 border-t-[#E31824]" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-white/60">
                Full Name
              </label>
              <div className="relative mt-2">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm text-white placeholder-white/30 outline-none transition focus:border-[#E31824] focus:ring-1 focus:ring-[#E31824]"
                  placeholder="Your full name"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-white/60">
                Email Address
              </label>
              <div className="relative mt-2">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type="email"
                  disabled
                  value={profile?.email || ""}
                  className="w-full cursor-not-allowed rounded-xl border border-white/5 bg-white/[0.02] py-3 pl-10 pr-4 text-sm text-white/40 outline-none"
                />
              </div>
              <p className="mt-1 text-[11px] text-white/30">
                Email address is linked to your account credentials and cannot be modified.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-white/60">
                Phone Number
              </label>
              <div className="relative mt-2">
                <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm text-white placeholder-white/30 outline-none transition focus:border-[#E31824] focus:ring-1 focus:ring-[#E31824]"
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>

            <div className="pt-2 space-y-3">
              <div className="flex items-center gap-2 rounded-xl border border-white/5 bg-white/[0.02] p-3 text-xs text-white/40">
                <ShieldCheck size={16} className="text-[#E31824]" />
                <span>Account Role: <strong className="text-white/80">{profile?.role || "CUSTOMER"}</strong></span>
              </div>

              <Link
                to="/security-questions"
                className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3.5 text-xs font-semibold text-white transition hover:border-[#E31824]/40 hover:bg-white/10"
              >
                <div className="flex items-center gap-2.5">
                  <KeyRound size={16} className="text-[#E31824]" />
                  <span>Configure Security Questions</span>
                </div>
                <ChevronRight size={14} className="text-white/40" />
              </Link>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#E31824] py-3 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-[#c8141f] active:scale-[0.99] disabled:opacity-50"
            >
              {saving ? "Saving Changes…" : "Update Profile"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
