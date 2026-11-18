import { Link } from "react-router-dom";
import { ArrowLeft, KeyRound, AlertCircle } from "lucide-react";

export default function ForgotPassword() {
  return (
    <div className="flex min-h-[75vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#121216] p-8 text-center shadow-2xl">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 mb-6">
          <KeyRound size={28} />
        </div>

        <h1 className="font-display text-2xl font-bold uppercase tracking-tight text-white">
          Password Recovery
        </h1>

        <div className="mt-4 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-left text-xs text-amber-200/90">
          <div className="flex items-start gap-2.5">
            <AlertCircle size={18} className="shrink-0 text-amber-400 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-300">Self-Service Reset Unavailable</p>
              <p className="mt-1 text-white/70">
                Automated email password reset is not currently supported by the active backend mail gateway.
                Please reach out to support or contact the system administrator to reset your account credentials.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-3">
          <Link
            to="/login"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#E31824] py-3 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-[#c8141f]"
          >
            <ArrowLeft size={14} /> Back to Sign In
          </Link>
          <Link
            to="/"
            className="block text-xs font-medium text-white/40 hover:text-white"
          >
            Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
