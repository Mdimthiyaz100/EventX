import { useState, type FormEvent } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, Lock, Mail, ShieldAlert } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function AdminLogin() {
  const { user, loading, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // Redirect if already logged in as Admin
  if (!loading && user?.role === "ADMIN") {
    return <Navigate replace to="/admin/dashboard" />;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setBusy(true);

    try {
      await login(email.trim(), password, "ADMIN");
      const destination = (location.state as { from?: string } | null)?.from ?? "/admin/dashboard";
      navigate(destination, { replace: true });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Sign-in failed. Please verify your administrator credentials.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-screen bg-[#FCF9F4] lg:grid-cols-[1.1fr_.9fr]">
      {/* Left side: Cinematic concert background */}
      <section className="relative hidden overflow-hidden bg-[#111111] p-12 text-white lg:flex lg:flex-col lg:justify-between xl:p-16">
        {/* Cinematic Concert Image */}
        <img
          src="https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=2200&q=90"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 size-full object-cover object-center opacity-45 mix-blend-luminosity"
        />
        {/* Moody Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/75 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-transparent to-black/60" />
        <div className="absolute -bottom-24 -left-20 size-[500px] rounded-full bg-[#E31824]/20 blur-[130px]" />

        {/* Top: EventX Logo */}
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-2">
            <span className="font-display text-4xl font-black uppercase tracking-tight text-white">
              Event<span className="text-[#E31824]">X</span>
            </span>
            <span className="rounded-full bg-white/10 px-3 py-0.5 font-sans text-[11px] font-bold uppercase tracking-wider text-white/80 backdrop-blur-sm">
              Admin Portal
            </span>
          </Link>
        </div>

        {/* Middle: Editorial Heading & Subtitle */}
        <div className="relative z-10 max-w-xl py-12">
          <p className="text-xs font-extrabold uppercase tracking-[.25em] text-[#E31824]">
            COMMAND CENTER
          </p>
          <h1 className="mt-4 font-display text-[clamp(3.5rem,5.5vw,5.5rem)] font-extrabold uppercase leading-[.85] tracking-tight text-white">
            CONTROL THE <span className="block text-[#E31824]">EXPERIENCE.</span>
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-white/75 sm:text-lg">
            Manage movies, events, entertainment and everything happening on EventX.
          </p>
        </div>

        {/* Bottom copyright */}
        <div className="relative z-10 flex items-center justify-between text-xs text-white/40">
          <p>© 2026 EventX Entertainment Systems.</p>
          <p className="font-mono text-[11px]">ADMIN.PORTAL.V2</p>
        </div>
      </section>

      {/* Right side: Cream / White login panel */}
      <section className="flex min-h-screen items-center justify-center bg-[#FCF9F4] px-6 py-12 sm:px-12 md:px-16">
        <div className="w-full max-w-[420px]">
          {/* Back to EventX website link */}
          <Link
            to="/"
            className="group mb-8 inline-flex items-center gap-2 text-xs font-bold text-slate-500 transition hover:text-[#E31824]"
          >
            <ArrowLeft size={15} className="transition-transform group-hover:-translate-x-0.5" />
            <span>Back to EventX website</span>
          </Link>

          {/* Heading */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#E31824]/10 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-[#E31824]">
              <Lock size={12} />
              <span>Admin Authentication</span>
            </div>
            <h2 className="mt-3 font-display text-4xl font-extrabold uppercase tracking-tight text-slate-900 sm:text-5xl">
              Admin Portal
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Sign in with your administrator credentials to access the console.
            </p>
          </div>

          {/* Error notice */}
          {error && (
            <div
              role="alert"
              className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-800"
            >
              <ShieldAlert size={18} className="mt-0.5 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-800" htmlFor="admin-email">
                Email Address
              </label>
              <div className="relative mt-2">
                <Mail
                  size={17}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  id="admin-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@eventx.com"
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[#E31824] focus:ring-4 focus:ring-[#E31824]/10"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800" htmlFor="admin-password">
                Password
              </label>
              <div className="relative mt-2">
                <Lock
                  size={17}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-12 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[#E31824] focus:ring-4 focus:ring-[#E31824]/10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {/* Remember me & Forgot Password */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="size-4 rounded border-slate-300 text-[#E31824] focus:ring-[#E31824]"
                />
                <span className="text-xs font-medium text-slate-600">Remember me</span>
              </label>

              <button
                type="button"
                onClick={() => alert("Please contact the primary system administrator to reset credentials.")}
                className="text-xs font-bold text-slate-500 hover:text-[#E31824]"
              >
                Forgot password?
              </button>
            </div>

            {/* Red Sign In Button */}
            <button
              type="submit"
              disabled={busy}
              className="mt-2 flex h-12 w-full items-center justify-center rounded-2xl bg-[#E31824] text-sm font-extrabold uppercase tracking-wider text-white shadow-lg shadow-[#E31824]/25 transition hover:bg-[#c4141e] disabled:opacity-60"
            >
              {busy ? "Authenticating…" : "Sign In to Admin Portal"}
            </button>
          </form>

          {/* Footer disclaimer */}
          <div className="mt-8 border-t border-slate-200/80 pt-6 text-center text-xs text-slate-400">
            <p>Authorized access only. All actions are logged and audited.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
