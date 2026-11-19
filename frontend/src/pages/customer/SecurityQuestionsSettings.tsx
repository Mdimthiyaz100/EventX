import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, ArrowLeft, CheckCircle2, AlertCircle, HelpCircle, Save } from "lucide-react";
import { authService } from "../../services/auth.service";

interface SecurityQuestionOption {
  id: string;
  question: string;
}

export default function SecurityQuestionsSettings() {
  const [questions, setQuestions] = useState<SecurityQuestionOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [hasExisting, setHasExisting] = useState(false);

  // 3 Selected Questions & Answers
  const [selectedQ1, setSelectedQ1] = useState("");
  const [answer1, setAnswer1] = useState("");

  const [selectedQ2, setSelectedQ2] = useState("");
  const [answer2, setAnswer2] = useState("");

  const [selectedQ3, setSelectedQ3] = useState("");
  const [answer3, setAnswer3] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [qList, status] = await Promise.all([
          authService.getSecurityQuestions(),
          authService.getSecurityStatus(),
        ]);
        setQuestions(qList || []);
        setHasExisting(status.hasSecurityQuestions);

        if (qList && qList.length >= 3) {
          setSelectedQ1(qList[0].id);
          setSelectedQ2(qList[1].id);
          setSelectedQ3(qList[2].id);
        }
      } catch (err: any) {
        setMessage({ type: "error", text: err.message || "Failed to load security questions." });
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    // Validate duplicate questions
    const selectedIds = new Set([selectedQ1, selectedQ2, selectedQ3]);
    if (selectedIds.size !== 3) {
      setMessage({ type: "error", text: "You must choose 3 different security questions." });
      return;
    }

    if (!answer1.trim() || !answer2.trim() || !answer3.trim()) {
      setMessage({ type: "error", text: "Please provide an answer for all 3 questions." });
      return;
    }

    setSaving(true);
    try {
      const payload = [
        { questionId: selectedQ1, answer: answer1.trim() },
        { questionId: selectedQ2, answer: answer2.trim() },
        { questionId: selectedQ3, answer: answer3.trim() },
      ];

      const res = hasExisting
        ? await authService.updateSecurityQuestions(payload)
        : await authService.setupSecurityQuestions(payload);

      setMessage({ type: "success", text: res.message || "Security questions updated successfully!" });
      setHasExisting(true);
      setAnswer1("");
      setAnswer2("");
      setAnswer3("");
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to save security questions." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="mb-6 flex items-center gap-3">
        <Link
          to="/profile"
          className="grid size-9 place-items-center rounded-xl border border-white/10 bg-white/5 text-white/60 hover:text-white"
        >
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="font-display text-2xl font-bold uppercase tracking-tight text-white">
            Security Questions
          </h1>
          <p className="text-xs text-white/50">
            Configure recovery questions used to reset your password if you ever lose access.
          </p>
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-[#121216] p-8 shadow-xl">
        <div className="flex items-center gap-3 border-b border-white/10 pb-5">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-[#E31824]/10 text-[#E31824]">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">
              {hasExisting ? "Update Security Questions" : "Setup Security Questions"}
            </h2>
            <p className="text-xs text-white/40">
              Answers are securely hashed with bcrypt. Never share your answers with anyone.
            </p>
          </div>
        </div>

        {message && (
          <div
            className={`mt-6 flex items-start gap-2.5 rounded-2xl p-4 text-xs font-semibold ${
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
          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            {/* Question 1 */}
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 space-y-3">
              <label className="flex items-center gap-2 text-xs font-bold text-white/80">
                <HelpCircle size={14} className="text-[#E31824]" />
                <span>Security Question 1</span>
              </label>
              <select
                value={selectedQ1}
                onChange={(e) => setSelectedQ1(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#121216] px-4 py-2.5 text-xs text-white outline-none focus:border-[#E31824]"
              >
                {questions.map((q) => (
                  <option key={q.id} value={q.id} className="bg-[#121216]">
                    {q.question}
                  </option>
                ))}
              </select>
              <input
                type="text"
                required
                value={answer1}
                onChange={(e) => setAnswer1(e.target.value)}
                placeholder="Answer for Question 1"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs text-white placeholder-white/30 outline-none focus:border-[#E31824]"
              />
            </div>

            {/* Question 2 */}
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 space-y-3">
              <label className="flex items-center gap-2 text-xs font-bold text-white/80">
                <HelpCircle size={14} className="text-[#E31824]" />
                <span>Security Question 2</span>
              </label>
              <select
                value={selectedQ2}
                onChange={(e) => setSelectedQ2(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#121216] px-4 py-2.5 text-xs text-white outline-none focus:border-[#E31824]"
              >
                {questions.map((q) => (
                  <option key={q.id} value={q.id} className="bg-[#121216]">
                    {q.question}
                  </option>
                ))}
              </select>
              <input
                type="text"
                required
                value={answer2}
                onChange={(e) => setAnswer2(e.target.value)}
                placeholder="Answer for Question 2"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs text-white placeholder-white/30 outline-none focus:border-[#E31824]"
              />
            </div>

            {/* Question 3 */}
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 space-y-3">
              <label className="flex items-center gap-2 text-xs font-bold text-white/80">
                <HelpCircle size={14} className="text-[#E31824]" />
                <span>Security Question 3</span>
              </label>
              <select
                value={selectedQ3}
                onChange={(e) => setSelectedQ3(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#121216] px-4 py-2.5 text-xs text-white outline-none focus:border-[#E31824]"
              >
                {questions.map((q) => (
                  <option key={q.id} value={q.id} className="bg-[#121216]">
                    {q.question}
                  </option>
                ))}
              </select>
              <input
                type="text"
                required
                value={answer3}
                onChange={(e) => setAnswer3(e.target.value)}
                placeholder="Answer for Question 3"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs text-white placeholder-white/30 outline-none focus:border-[#E31824]"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#E31824] py-3 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-red-600/30 transition hover:bg-[#c8141f] disabled:opacity-50"
            >
              <Save size={15} />
              <span>{saving ? "Saving Security Questions…" : "Save Security Questions"}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
