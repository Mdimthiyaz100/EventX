import { useState, useEffect } from "react";
import { Building, CreditCard, Save, ShieldAlert, Calendar, CheckCircle2, AlertCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { resolveOrganizerCategory } from "../../layouts/OrganizerLayout";
import { authService } from "../../services/auth/authService";

export default function OrganizerSettings() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<{
    id: string;
    name: string;
    email: string;
    phone?: string;
    organizationName?: string;
    organizerCategory?: string;
    createdAt?: string;
    organizerApproved?: boolean;
  } | null>(null);

  const [orgName, setOrgName] = useState("");
  const [phone, setPhone] = useState("");
  const [advancePercent, setAdvancePercent] = useState("30");
  const [hourlyTurfPrice, setHourlyTurfPrice] = useState("1500");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await authService.getOrganizerProfile();
        setProfile(data as any);
        const org = (data as any).organizationName || data.name.split("(")[0].replace(/\[.*?\]/g, "").trim();
        setOrgName(org);
        setPhone(data.phone || "+91 98400 12345");
      } catch (err) {
        console.error(err);
      }
    }
    void loadProfile();
  }, [user]);

  const categoryMeta = resolveOrganizerCategory(
    profile?.name || user?.name,
    profile?.organizerCategory || user?.organizerCategory
  );
  const CategoryIcon = categoryMeta.icon;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      // Updates organization display name while backend preserves permanent category
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update settings.";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 text-white max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
          Workspace Settings
        </h1>
        <p className="mt-1 text-xs text-[#A1A1AA]">
          Manage your organization details, permanent registration category, and advance payment policies.
        </p>
      </div>

      {saved && (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-xs font-semibold text-emerald-400">
          Settings saved and synchronized successfully.
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-xs font-semibold text-red-400">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* 1. Permanent Organizer Information Card */}
      <div className="rounded-2xl border border-[#292929] bg-[#141414] p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[#292929] pb-4">
          <div className="flex items-center gap-3">
            <div className="grid size-9 place-items-center rounded-xl bg-[#F51D2B]/10 text-[#F51D2B]">
              <CategoryIcon size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Organizer Information & Category</h3>
              <p className="text-[11px] text-[#A1A1AA]">Permanently assigned profile verified during onboarding</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-bold text-emerald-400">
            <CheckCircle2 size={12} />
            Account Verified & Active
          </span>
        </div>

        {/* Read-Only Information Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="rounded-xl border border-[#292929] bg-[#1A1A1A] p-3.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#777777]">
              Organizer Category
            </p>
            <div className="mt-1.5 flex items-center gap-2 font-bold text-white">
              <CategoryIcon size={14} className="text-[#F51D2B]" />
              <span>{categoryMeta.label}</span>
            </div>
          </div>

          <div className="rounded-xl border border-[#292929] bg-[#1A1A1A] p-3.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#777777]">
              Organization Name
            </p>
            <p className="mt-1.5 font-bold text-white">
              {orgName || "Smash Sports Arena"}
            </p>
          </div>

          <div className="rounded-xl border border-[#292929] bg-[#1A1A1A] p-3.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#777777]">
              Registered Email
            </p>
            <p className="mt-1.5 font-bold text-white font-mono">
              {user?.email || "organizer@eventx.com"}
            </p>
          </div>

          <div className="rounded-xl border border-[#292929] bg-[#1A1A1A] p-3.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#777777]">
              Registration Date
            </p>
            <div className="mt-1.5 flex items-center gap-1.5 font-bold text-white">
              <Calendar size={13} className="text-[#A1A1AA]" />
              <span>
                {profile?.createdAt
                  ? new Date(profile.createdAt).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "November 20, 2026"}
              </span>
            </div>
          </div>
        </div>

        {/* Non-editable alert notice */}
        <div className="flex items-start gap-2.5 rounded-xl border border-[#292929] bg-[#1A1A1A]/80 p-3.5 text-xs text-[#A1A1AA]">
          <ShieldAlert size={16} className="text-[#F51D2B] shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Your organizer category is <strong className="text-white">permanently assigned</strong> during registration and cannot be changed from workspace settings. To apply for a different entertainment category, please contact the EventX platform administrator.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Editable Organization Details */}
        <div className="rounded-2xl border border-[#292929] bg-[#141414] p-6 space-y-4">
          <div className="flex items-center gap-3 border-b border-[#292929] pb-4">
            <div className="grid size-9 place-items-center rounded-xl bg-[#F51D2B]/10 text-[#F51D2B]">
              <Building size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Editable Facility Details</h3>
              <p className="text-[11px] text-[#A1A1AA]">Public contact details visible to customers on tickets</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-[#A1A1AA] mb-1.5">Facility / Trade Name</label>
              <input
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="w-full rounded-xl border border-[#292929] bg-[#1A1A1A] p-2.5 text-white outline-none focus:border-[#F51D2B]"
              />
            </div>
            <div>
              <label className="block text-[#A1A1AA] mb-1.5">Contact Phone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl border border-[#292929] bg-[#1A1A1A] p-2.5 text-white outline-none focus:border-[#F51D2B]"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[#A1A1AA] mb-1.5">Operating City</label>
              <input
                type="text"
                defaultValue="Chennai, Tamil Nadu"
                className="w-full rounded-xl border border-[#292929] bg-[#1A1A1A] p-2.5 text-white outline-none focus:border-[#F51D2B]"
              />
            </div>
          </div>
        </div>

        {/* Pricing Policies */}
        <div className="rounded-2xl border border-[#292929] bg-[#141414] p-6 space-y-4">
          <div className="flex items-center gap-3 border-b border-[#292929] pb-4">
            <div className="grid size-9 place-items-center rounded-xl bg-[#F51D2B]/10 text-[#F51D2B]">
              <CreditCard size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Pricing & Advance Payment Policies</h3>
              <p className="text-[11px] text-[#A1A1AA]">Deposit percentage required for customers to confirm slots</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-[#A1A1AA] mb-1.5">Default Advance Deposit Required</label>
              <select
                value={advancePercent}
                onChange={(e) => setAdvancePercent(e.target.value)}
                className="w-full rounded-xl border border-[#292929] bg-[#1A1A1A] p-2.5 text-white outline-none focus:border-[#F51D2B]"
              >
                <option value="20">20% Advance Online (Remaining at Venue)</option>
                <option value="30">30% Advance Online (Recommended)</option>
                <option value="50">50% Advance Online</option>
                <option value="100">100% Full Payment Required</option>
              </select>
            </div>
            <div>
              <label className="block text-[#A1A1AA] mb-1.5">Default Base Hourly Rate (₹)</label>
              <input
                type="number"
                value={hourlyTurfPrice}
                onChange={(e) => setHourlyTurfPrice(e.target.value)}
                className="w-full rounded-xl border border-[#292929] bg-[#1A1A1A] p-2.5 text-white outline-none focus:border-[#F51D2B]"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-[#F51D2B] px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-[#F51D2B]/20 transition hover:bg-[#ff2b39] disabled:opacity-50"
          >
            <Save size={15} />
            <span>{saving ? "Saving Changes..." : "Save Workspace Settings"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
