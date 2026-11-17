import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  Phone,
  Film,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  // Form Fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Password strength checker helper
  const getPasswordStrength = () => {
    if (!password) return { score: 0, label: "", color: "" };
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) return { score: 1, label: "Weak", color: "bg-red-500" };
    if (score === 2) return { score: 2, label: "Fair", color: "bg-amber-500" };
    if (score === 3) return { score: 3, label: "Good", color: "bg-blue-500" };
    return { score: 4, label: "Strong", color: "bg-emerald-500" };
  };

  const strength = getPasswordStrength();

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");

    // Frontend Validations
    if (!name.trim()) {
      setError("Please provide your full name.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    if (phone.trim()) {
      const phoneDigits = phone.replace(/\D/g, "");
      if (phoneDigits.length < 10 || phoneDigits.length > 15) {
        setError("Please enter a valid 10-digit mobile or international phone number.");
        return;
      }
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters in length.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please verify both entries.");
      return;
    }

    setBusy(true);

    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
        phone: phone.trim() || undefined,
      });

      setSuccess(true);
      // Wait 1.5 seconds so user reads success message, then redirect to login
      setTimeout(() => {
        navigate("/login", { replace: true, state: { registeredEmail: email.trim() } });
      }, 1500);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Registration failed. An account with this email may already exist.",
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
          src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=2200&q=90"
          alt="Concert Experience"
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
            Join the Community
          </span>
        </div>

        {/* Middle hero copy */}
        <div className="relative z-10 my-auto max-w-xl py-12">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-300 backdrop-blur-sm">
            <Film size={14} className="text-[#E31824]" />
            <span>Discover · Reserve · Experience</span>
          </div>
          <h1 className="font-display text-5xl font-black uppercase tracking-tight text-white sm:text-6xl xl:text-7xl leading-none">
            START YOUR <br />
            <span className="text-[#E31824]">JOURNEY TODAY.</span>
          </h1>
          <p className="mt-6 text-base font-normal leading-relaxed text-slate-300">
            Create your account to unlock early-bird concert tickets, seat reservations for blockbuster cinema releases, and customized event alerts.
          </p>

          <div className="mt-8 flex flex-col gap-3 text-sm text-slate-300">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 size={16} className="text-[#E31824]" />
              <span>Instant booking confirmation and QR code passes</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 size={16} className="text-[#E31824]" />
              <span>Save your favorite artists and bookmark upcoming tours</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 size={16} className="text-[#E31824]" />
              <span>Manage your tickets and receipts anytime in My Bookings</span>
            </div>
          </div>
        </div>

        {/* Footer quote */}
        <div className="relative z-10 border-t border-white/10 pt-6 text-xs text-slate-400">
          <span>© 2026 EventX Inc. India's premier entertainment destination.</span>
        </div>
      </section>

      {/* Right side: Registration Form */}
      <section className="flex flex-col justify-between bg-[#12101B] p-8 sm:p-12 lg:p-16 overflow-y-auto">
        <div className="flex items-center justify-between">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 transition hover:text-white"
          >
            <ArrowLeft size={16} />
            <span>Back to Login</span>
          </Link>

          <Link
            to="/"
            className="font-display text-2xl font-black uppercase tracking-tight text-white lg:hidden"
          >
            Event<span className="text-[#E31824]">X</span>
          </Link>
        </div>

        <div className="mx-auto w-full max-w-md py-8">
          <div className="mb-6">
            <div className="mb-2 text-xs font-bold uppercase tracking-widest text-[#E31824]">
              Create New Account
            </div>
            <h2 className="font-display text-3xl font-extrabold uppercase tracking-tight text-white sm:text-4xl">
              JOIN EVENTX
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Sign up in seconds to start discovering and booking events.
            </p>
          </div>

          {/* Success Message Banner */}
          {success && (
            <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs font-semibold text-emerald-300">
              <CheckCircle2 size={18} className="shrink-0 text-emerald-400" />
              <span>Account created successfully! Redirecting you to login…</span>
            </div>
          )}

          {/* Error Message Banner */}
          {error && (
            <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-xs font-medium text-red-400">
              <AlertCircle size={18} className="shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label
                htmlFor="reg-name"
                className="block text-xs font-bold uppercase tracking-wider text-slate-300"
              >
                Full Name <span className="text-[#E31824]">*</span>
              </label>
              <div className="relative mt-1.5">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                  <User size={16} />
                </div>
                <input
                  id="reg-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm text-white placeholder-slate-500 transition focus:border-[#E31824] focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-[#E31824]"
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label
                htmlFor="reg-email"
                className="block text-xs font-bold uppercase tracking-wider text-slate-300"
              >
                Email Address <span className="text-[#E31824]">*</span>
              </label>
              <div className="relative mt-1.5">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                  <Mail size={16} />
                </div>
                <input
                  id="reg-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm text-white placeholder-slate-500 transition focus:border-[#E31824] focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-[#E31824]"
                />
              </div>
            </div>

            {/* Phone Number (Optional) */}
            <div>
              <label
                htmlFor="reg-phone"
                className="block text-xs font-bold uppercase tracking-wider text-slate-300"
              >
                Phone Number <span className="text-slate-500 text-[10px] font-normal">(Optional)</span>
              </label>
              <div className="relative mt-1.5">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                  <Phone size={16} />
                </div>
                <input
                  id="reg-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 9876543210"
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm text-white placeholder-slate-500 transition focus:border-[#E31824] focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-[#E31824]"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="reg-password"
                className="block text-xs font-bold uppercase tracking-wider text-slate-300"
              >
                Password <span className="text-[#E31824]">*</span>
              </label>
              <div className="relative mt-1.5">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                  <Lock size={16} />
                </div>
                <input
                  id="reg-password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 8 characters"
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

              {/* Password strength meter */}
              {password && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 flex gap-1 h-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-full flex-1 rounded-full transition-all ${
                          i <= strength.score ? strength.color : "bg-white/10"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] font-bold uppercase text-slate-400">
                    {strength.label}
                  </span>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="reg-confirm-password"
                className="block text-xs font-bold uppercase tracking-wider text-slate-300"
              >
                Confirm Password <span className="text-[#E31824]">*</span>
              </label>
              <div className="relative mt-1.5">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                  <Lock size={16} />
                </div>
                <input
                  id="reg-confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-11 text-sm text-white placeholder-slate-500 transition focus:border-[#E31824] focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-[#E31824]"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-white"
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={busy || success}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#E31824] py-3.5 text-sm font-bold uppercase tracking-wider text-white shadow-lg shadow-red-600/30 transition hover:bg-[#c8141f] active:scale-[0.99] disabled:opacity-60"
            >
              {busy ? (
                <>
                  <div className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Creating Account…</span>
                </>
              ) : success ? (
                <span>Account Created!</span>
              ) : (
                <span>Create EventX Account</span>
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-xs text-slate-400">
            <span>Already have an EventX account? </span>
            <Link
              to="/login"
              className="font-bold text-[#E31824] hover:underline"
            >
              Sign In here &rarr;
            </Link>
          </div>
        </div>

        <div className="border-t border-white/10 pt-4 text-center text-xs text-slate-500">
          <span>Are you an administrator? </span>
          <Link
            to="/admin/login"
            className="font-bold text-slate-300 hover:text-white underline underline-offset-2 ml-1"
          >
            Admin Sign In &rarr;
          </Link>
        </div>
      </section>
    </div>
  );
}
