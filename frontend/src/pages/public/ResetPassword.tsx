import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";
import { authService } from "../../services/auth.service";

interface LocationState {
  recoveryToken: string;
  email: string;
}

export default function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState | undefined;

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (!state || !state.recoveryToken) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4 py-12 text-center">
        <div className="max-w-md rounded-2xl border border-white/10 bg-[#121216] p-8">
          <AlertCircle size={40} className="mx-auto text-red-500 mb-3" />
          <h2 className="text-lg font-bold text-white">Missing Recovery Token</h2>
          <p className="mt-2 text-xs text-white/50">
            A valid security verification token is required to reset your password.
          </p>
          <Link
            to="/forgot-password"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#E31824] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white"
          >
            Start Recovery
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New password and confirm password do not match.");
      return;
    }

    setSubmitting(true);

    try {
      await authService.resetPasswordSecurity(state.recoveryToken, newPassword);
      setSuccess(true);
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err: any) {
      setError(err.message || "Failed to reset password. Token may have expired or already been used.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[75vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#121216] p-8 shadow-2xl">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-[#E31824]/10 text-[#E31824] mb-6">
          <Lock size={28} />
        </div>

        <h1 className="text-center font-display text-2xl font-bold uppercase tracking-tight text-white">
          Reset Your Password
        </h1>
        <p className="mt-2 text-center text-xs text-white/50">
          Enter a strong, secure new password for account:
          <br />
          <strong className="text-white/80">{state.email}</strong>
        </p>

        {error && (
          <div className="mt-6 flex items-start gap-2.5 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-xs font-semibold text-red-400">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-6 text-center">
            <CheckCircle2 size={40} className="mx-auto text-emerald-400 mb-3" />
            <h3 className="text-base font-bold text-white">Password Reset Successful!</h3>
            <p className="mt-1 text-xs text-emerald-200">
              All active sessions have been invalidated. Redirecting to login...
            </p>
            <Link
              to="/login"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#E31824] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white"
            >
              Sign In Now <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-white/60 mb-2">
                New Password (min 8 chars)
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-4 pr-10 text-xs text-white placeholder-white/30 outline-none focus:border-[#E31824]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-white/60 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-4 pr-10 text-xs text-white placeholder-white/30 outline-none focus:border-[#E31824]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || !newPassword || !confirmPassword}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#E31824] py-3 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-red-600/30 transition hover:bg-[#c8141f] disabled:opacity-50"
            >
              {submitting ? "Updating Password…" : "Update Password & Invalidate Sessions"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
