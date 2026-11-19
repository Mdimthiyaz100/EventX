import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, KeyRound, Mail, ArrowRight, AlertCircle, ShieldAlert } from "lucide-react";
import { authService } from "../../services/auth.service";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [noQuestionsNotice, setNoQuestionsNotice] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setError("");
    setNoQuestionsNotice(false);
    setSubmitting(true);

    try {
      const response = await authService.forgotPassword(email.trim());

      if (response.hasQuestions && response.questions.length === 3) {
        // Navigate to security questions verification with email & questions in state
        navigate("/verify-security-questions", {
          state: {
            email: email.trim(),
            questions: response.questions,
          },
        });
      } else {
        // User has not configured security questions or account not found
        setNoQuestionsNotice(true);
      }
    } catch (err: any) {
      setError(err.message || "Failed to initiate password recovery. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[75vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#121216] p-8 shadow-2xl">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-[#E31824]/10 text-[#E31824] mb-6">
          <KeyRound size={28} />
        </div>

        <h1 className="text-center font-display text-2xl font-bold uppercase tracking-tight text-white">
          Forgot Password
        </h1>
        <p className="mt-2 text-center text-xs text-white/50">
          Enter your registered email address to recover your account using your configured security questions.
        </p>

        {error && (
          <div className="mt-6 flex items-start gap-2.5 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-xs font-semibold text-red-400">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {noQuestionsNotice && (
          <div className="mt-6 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-left text-xs text-amber-200">
            <div className="flex items-start gap-2.5">
              <ShieldAlert size={18} className="shrink-0 text-amber-400 mt-0.5" />
              <div>
                <p className="font-bold text-amber-300">Security Questions Unavailable</p>
                <p className="mt-1 text-white/70">
                  Either this email is not registered, or security questions have not been set up for this account.
                  Please contact EventX support or your administrator for assistance.
                </p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-white/60 mb-2">
              Registered Email
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-xs text-white placeholder-white/30 outline-none focus:border-[#E31824]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || !email.trim()}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#E31824] py-3 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-red-600/30 transition hover:bg-[#c8141f] disabled:opacity-50"
          >
            {submitting ? "Searching Account…" : "Continue with Security Questions"}
            <ArrowRight size={14} />
          </button>
        </form>

        <div className="mt-8 border-t border-white/5 pt-4 text-center space-y-2">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/60 hover:text-white"
          >
            <ArrowLeft size={13} />
            <span>Back to Sign In</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
