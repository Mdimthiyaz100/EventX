import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { ShieldCheck, ArrowRight, ArrowLeft, AlertCircle, HelpCircle } from "lucide-react";
import { authService } from "../../services/auth.service";

interface LocationState {
  email: string;
  questions: Array<{ questionId: string; question: string }>;
}

export default function VerifySecurityQuestions() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState | undefined;

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!state || !state.email || !state.questions || state.questions.length !== 3) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4 py-12 text-center">
        <div className="max-w-md rounded-2xl border border-white/10 bg-[#121216] p-8">
          <AlertCircle size={40} className="mx-auto text-red-500 mb-3" />
          <h2 className="text-lg font-bold text-white">Session Expired or Missing Information</h2>
          <p className="mt-2 text-xs text-white/50">
            Please begin the password recovery process by entering your email address first.
          </p>
          <Link
            to="/forgot-password"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#E31824] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white"
          >
            Go to Forgot Password
          </Link>
        </div>
      </div>
    );
  }

  const handleAnswerChange = (questionId: string, val: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: val }));
  };

  const allAnswered = state.questions.every((q) => (answers[q.questionId] || "").trim().length > 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allAnswered) {
      setError("Please provide an answer for all 3 security questions.");
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      const payload = state.questions.map((q) => ({
        questionId: q.questionId,
        answer: answers[q.questionId].trim(),
      }));

      const response = await authService.verifySecurityAnswers(state.email, payload);

      if (response.verified && response.recoveryToken) {
        // Forward recovery token to reset password page
        navigate("/reset-password", {
          state: {
            recoveryToken: response.recoveryToken,
            email: state.email,
          },
        });
      }
    } catch (err: any) {
      setError(err.message || "Failed to verify security answers.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[75vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#121216] p-8 shadow-2xl">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-[#E31824]/10 text-[#E31824] mb-6">
          <ShieldCheck size={28} />
        </div>

        <h1 className="text-center font-display text-2xl font-bold uppercase tracking-tight text-white">
          Verify Security Questions
        </h1>
        <p className="mt-2 text-center text-xs text-white/50">
          Answer your configured security questions to authenticate password reset for:
          <br />
          <strong className="text-white/80">{state.email}</strong>
        </p>

        {error && (
          <div className="mt-6 flex items-start gap-2.5 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-xs font-semibold text-red-400">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {state.questions.map((q, idx) => (
            <div key={q.questionId} className="space-y-1.5">
              <label className="flex items-center gap-2 text-xs font-bold text-white/80">
                <HelpCircle size={14} className="text-[#E31824]" />
                <span>Question {idx + 1}: {q.question}</span>
              </label>
              <input
                type="text"
                required
                value={answers[q.questionId] || ""}
                onChange={(e) => handleAnswerChange(q.questionId, e.target.value)}
                placeholder="Enter your exact answer"
                className="w-full rounded-xl border border-white/10 bg-white/5 py-3 px-4 text-xs text-white placeholder-white/30 outline-none focus:border-[#E31824]"
              />
            </div>
          ))}

          <button
            type="submit"
            disabled={submitting || !allAnswered}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#E31824] py-3 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-red-600/30 transition hover:bg-[#c8141f] disabled:opacity-50"
          >
            {submitting ? "Verifying Answers…" : "Verify & Continue"}
            <ArrowRight size={14} />
          </button>
        </form>

        <div className="mt-8 border-t border-white/5 pt-4 text-center">
          <Link
            to="/forgot-password"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/60 hover:text-white"
          >
            <ArrowLeft size={13} />
            <span>Change Email</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
