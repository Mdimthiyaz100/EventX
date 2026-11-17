import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, Lock, Mail, Film, CheckCircle2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function UserLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setBusy(true);

    try {
      await login(email.trim(), password);
      navigate("/movies", { replace: true });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Sign-in failed. Please check your credentials.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-screen bg-[#0E0C15] lg:grid-cols-[1.1fr_.9fr] text-white">
      {/* Left side: Cinematic movie & event imagery */}
      <section className="relative hidden overflow-hidden bg-[#0A0910] p-12 lg:flex lg:flex-col lg:justify-between xl:p-16">
        <img
          src="https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=2200&q=90"
          alt="Cinema Experience"
          className="absolute inset-0 size-full object-cover opacity-35 filter brightness-75 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0E0C15] via-[#0E0C15]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#0E0C15]/40 to-[#0E0C15]" />

        {/* Brand header */}
        <div className="relative z-10 flex items-center justify-between">
          <Link
            to="/"
            className="font-display text-3xl font-black uppercase tracking-tight text-white transition hover:opacity-90"
          >
            Event<span className="text-[#E31824]">X</span>
          </Link>
          <span className="rounded-full border border-red-500/30 bg-red-500/10 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-red-400 backdrop-blur-md">
            Audience Portal
          </span>
        </div>

        {/* Middle hero copy */}
        <div className="relative z-10 my-auto max-w-xl py-12">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-300 backdrop-blur-sm">
            <Film size={14} className="text-[#E31824]" />
            <span>Movies · Concerts · Standup · Festivals</span>
          </div>
          <h1 className="font-display text-5xl font-black uppercase tracking-tight text-white sm:text-6xl xl:text-7xl leading-none">
            EXPERIENCE THE <span className="text-[#E31824]">SPECTACLE.</span>
          </h1>
          <p className="mt-6 text-base font-normal leading-relaxed text-slate-300">
            Book premium cinema seats, discover sold-out stadium concerts, and reserve unforgettable live entertainment moments.
          </p>

          <div className="mt-8 flex flex-col gap-3 text-sm text-slate-300">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 size={16} className="text-[#E31824]" />
              <span>Instant confirmed e-tickets and QR entry passes</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 size={16} className="text-[#E31824]" />
              <span>Exclusive access to premiere movies & stage shows</span>
            </div>
          </div>
        </div>

        {/* Footer quote */}
        <div className="relative z-10 border-t border-white/10 pt-6 text-xs text-slate-400">
          <span>© 2026 EventX Inc. Your gateway to extraordinary entertainment.</span>
        </div>
      </section>

      {/* Right side: Login Panel */}
      <section className="flex flex-col justify-between bg-[#12101B] p-8 sm:p-12 lg:p-16">
        <div className="flex items-center justify-between">
          <Link
            to="/choose-portal"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 transition hover:text-white"
          >
            <ArrowLeft size={16} />
            <span>Back to Portal Selector</span>
          </Link>

          <Link
            to="/"
            className="font-display text-2xl font-black uppercase tracking-tight text-white lg:hidden"
          >
            Event<span className="text-[#E31824]">X</span>
          </Link>
        </div>

        <div className="mx-auto w-full max-w-md py-10">
          <div className="mb-8">
            <div className="mb-2 text-xs font-bold uppercase tracking-widest text-[#E31824]">
              Member Sign In
            </div>
            <h2 className="font-display text-3xl font-extrabold uppercase tracking-tight text-white sm:text-4xl">
              WELCOME BACK
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Sign in to manage your tickets, saved movies, and upcoming events.
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-xs font-medium text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="user-email"
                className="block text-xs font-bold uppercase tracking-wider text-slate-300"
              >
                Email Address
              </label>
              <div className="relative mt-2">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                  <Mail size={16} />
                </div>
                <input
                  id="user-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm text-white placeholder-slate-500 transition focus:border-[#E31824] focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-[#E31824]"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="user-password"
                className="block text-xs font-bold uppercase tracking-wider text-slate-300"
              >
                Password
              </label>
              <div className="relative mt-2">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                  <Lock size={16} />
                </div>
                <input
                  id="user-password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-11 text-sm text-white placeholder-slate-500 transition focus:border-[#E31824] focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-[#E31824]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex cursor-pointer items-center gap-2 text-slate-400 select-none hover:text-slate-300">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="size-4 rounded border-white/20 bg-white/5 text-[#E31824] focus:ring-0 focus:ring-offset-0"
                />
                <span>Remember me</span>
              </label>

              <a
                href="#forgot-password"
                onClick={(e) => {
                  e.preventDefault();
                  alert("Password reset instructions will be sent to your email.");
                }}
                className="font-semibold text-slate-400 hover:text-[#E31824]"
              >
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={busy}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#E31824] py-3.5 text-sm font-bold uppercase tracking-wider text-white shadow-lg shadow-red-600/30 transition hover:bg-[#c8141f] active:scale-[0.99] disabled:opacity-60"
            >
              {busy ? (
                <>
                  <div className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Signing In…</span>
                </>
              ) : (
                <span>Sign In as User</span>
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-xs text-slate-400">
            <span>Don't have an account yet? </span>
            <Link
              to="/register"
              className="font-bold text-[#E31824] hover:underline"
            >
              Explore EventX & Register
            </Link>
          </div>
        </div>

        <div className="border-t border-white/10 pt-4 text-center text-xs text-slate-500">
          <span>Are you an administrator? </span>
          <Link
            to="/admin/login"
            className="font-bold text-slate-300 hover:text-white underline underline-offset-2 ml-1"
          >
            Access Admin Portal &rarr;
          </Link>
        </div>
      </section>
    </div>
  );
}
