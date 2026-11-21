import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, ArrowRight, AlertCircle, Building2, Clock3 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function OrganizerLogin() {
  const navigate = useNavigate();
  const { loginAsOrganizer } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsPending(false);
    setLoading(true);

    try {
      await loginAsOrganizer(email.trim().toLowerCase(), password);
      navigate("/organizer/dashboard");
    } catch (err: any) {
      if (err.code === "APPLICATION_PENDING" || err.message?.includes("pending administrator approval")) {
        setIsPending(true);
      } else {
        const msg = err.message || "Invalid organizer credentials.";
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#000000] px-4 py-12 text-white">
      <div className="w-full max-w-md rounded-3xl border border-[#292929] bg-[#111111] p-8 shadow-2xl">
        <div className="text-center mb-8">
          <Link
            to="/"
            className="font-display text-3xl font-black uppercase tracking-tight text-white"
          >
            EVENT<span className="text-[#ED1C24]">X</span>
          </Link>
          <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-[#ED1C24]/30 bg-[#ED1C24]/10 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#ED1C24]">
            <Building2 size={12} />
            Organizer Portal
          </div>
          <h1 className="mt-4 font-display text-2xl font-black uppercase tracking-tight text-white">
            Organizer Sign In
          </h1>
          <p className="mt-1 text-xs text-[#777777]">
            Sign in to manage your facilities, screens, concerts, and bookings.
          </p>
        </div>

        {isPending && (
          <div className="mb-6 rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-4 text-xs text-yellow-300 space-y-2">
            <div className="flex items-center gap-2 font-bold">
              <Clock3 size={16} />
              <span>Application Under Review</span>
            </div>
            <p className="text-[11px] text-yellow-200/80 leading-relaxed">
              Your organizer account is awaiting administrator review and approval. You will receive access as soon as your venue or organization is verified.
            </p>
          </div>
        )}

        {error && !isPending && (
          <div className="mb-6 flex items-center gap-2 rounded-xl border border-[#EF4444]/30 bg-[#EF4444]/10 p-3 text-xs text-[#EF4444]">
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-[#BDBDBD] block mb-1.5">Business Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-3 text-[#777777]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="organizer@venue.com"
                className="w-full rounded-xl border border-[#292929] bg-[#0A0A0A] py-2.5 pl-10 pr-4 text-xs text-white placeholder-[#777777] focus:border-[#ED1C24] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#BDBDBD] block mb-1.5">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-3 text-[#777777]" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-[#292929] bg-[#0A0A0A] py-2.5 pl-10 pr-4 text-xs text-white placeholder-[#777777] focus:border-[#ED1C24] focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#ED1C24] py-3 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-[#ED1C24]/30 hover:bg-[#FF3038] disabled:opacity-50 transition"
          >
            {loading ? "Verifying..." : "Access Organizer Dashboard"}
            <ArrowRight size={15} />
          </button>
        </form>

        <div className="mt-8 border-t border-[#292929] pt-6 text-center text-xs text-[#777777]">
          <span>Want to list your sports turf, cinema, or concert? </span>
          <Link to="/organizer/register" className="font-bold text-[#ED1C24] hover:underline">
            Register as Organizer
          </Link>
        </div>
      </div>
    </div>
  );
}
