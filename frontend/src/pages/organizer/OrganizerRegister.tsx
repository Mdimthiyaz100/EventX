import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Building2,
  Trophy,
  Film,
  Music,
  Laugh,
  BookOpen,
  Calendar,
  CheckCircle2,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { authService } from "../../services/auth/authService";

type OrganizerCategory =
  | "Sports"
  | "Cinema / Theatre"
  | "Concert"
  | "Comedy"
  | "Workshop"
  | "General Events";

export default function OrganizerRegister() {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedCategory, setSelectedCategory] = useState<OrganizerCategory>("Sports");

  // Form Fields
  const [contactName, setContactName] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const categories = [
    {
      id: "Sports" as OrganizerCategory,
      title: "Sports & Turf Organizer",
      desc: "Manage sports grounds, box cricket, badminton courts & advance slot payments.",
      icon: Trophy,
    },
    {
      id: "Cinema / Theatre" as OrganizerCategory,
      title: "Cinema / Theatre Organizer",
      desc: "Manage movie screens, showtimes, dynamic seating layouts & ticket tariffs.",
      icon: Film,
    },
    {
      id: "Concert" as OrganizerCategory,
      title: "Concert Organizer",
      desc: "Host stadium music tours, festival lineups & tiered VIP/Fan Pit ticketing.",
      icon: Music,
    },
    {
      id: "Comedy" as OrganizerCategory,
      title: "Comedy Organizer",
      desc: "Host stand-up comedy specials, club nights & seat allocations.",
      icon: Laugh,
    },
    {
      id: "Workshop" as OrganizerCategory,
      title: "Workshop Organizer",
      desc: "Host masterclasses, hands-on seminars & participant cohort enrollments.",
      icon: BookOpen,
    },
    {
      id: "General Events" as OrganizerCategory,
      title: "General Event Organizer",
      desc: "Conferences, exhibitions, meetups & community entertainment experiences.",
      icon: Calendar,
    },
  ];

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    // Validate phone number
    const phoneRegex = /^\+?[0-9\s-]{7,16}$/;
    if (!phoneRegex.test(phone.trim())) {
      setError("Please enter a valid phone number (7 to 16 digits).");
      return;
    }

    // Password validation
    if (password.length < 8) {
      setError("Password does not meet security requirements. Minimum 8 characters required.");
      return;
    }

    // Confirm password match
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await authService.registerOrganizer({
        organizerCategory: selectedCategory,
        contactName: contactName.trim(),
        organizationName: organizationName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        password,
      });
      setSuccess(true);
    } catch (err: any) {
      const msg = err.message || "Unable to complete registration. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#000000] px-4 py-12 text-white">
      <div className="w-full max-w-2xl rounded-3xl border border-[#292929] bg-[#111111] p-8 sm:p-10 shadow-2xl">
        <div className="text-center mb-8">
          <Link
            to="/"
            className="font-display text-3xl font-black uppercase tracking-tight text-white"
          >
            EVENT<span className="text-[#ED1C24]">X</span>
          </Link>
          <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-[#ED1C24]/30 bg-[#ED1C24]/10 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#ED1C24]">
            <Building2 size={12} />
            Organizer Onboarding
          </div>
          <h1 className="mt-4 font-display text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
            {step === 1 ? "Select Your Category" : "Organization Details"}
          </h1>
          <p className="mt-1 text-xs text-[#777777]">
            {step === 1
              ? "Choose your category before opening the registration form."
              : `Register your venue or organization under the ${selectedCategory} category.`}
          </p>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-2 rounded-xl border border-[#EF4444]/30 bg-[#EF4444]/10 p-3 text-xs text-[#EF4444]">
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="py-8 text-center space-y-4">
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-[#16A34A]/20 text-[#16A34A]">
              <CheckCircle2 size={32} />
            </div>
            <h2 className="text-xl font-bold text-white">Application Submitted Successfully!</h2>
            <p className="text-xs text-[#BDBDBD] max-w-md mx-auto leading-relaxed">
              Your organizer application has been submitted successfully for <span className="font-bold text-white">{organizationName}</span> under <span className="font-bold text-[#ED1C24]">{selectedCategory}</span>.
            </p>
            <div className="rounded-2xl border border-[#292929] bg-[#0A0A0A] p-4 text-xs text-[#777777] max-w-sm mx-auto">
              <span>Status: </span>
              <span className="font-bold text-[#ED1C24]">PENDING APPROVAL</span>
              <p className="mt-1 text-[11px]">Your account is pending administrator approval. You will be able to access the dashboard once reviewed.</p>
            </div>
            <div className="pt-4">
              <Link
                to="/organizer/login"
                className="inline-flex items-center gap-2 rounded-xl bg-[#ED1C24] px-6 py-2.5 text-xs font-bold uppercase text-white hover:bg-[#FF3038]"
              >
                Go to Organizer Login
              </Link>
            </div>
          </div>
        ) : step === 1 ? (
          /* STEP 1: CATEGORY SELECTION */
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isSelected = selectedCategory === cat.id;
                return (
                  <div
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`cursor-pointer rounded-2xl border p-4 transition ${
                      isSelected
                        ? "border-[#ED1C24] bg-[#ED1C24]/10"
                        : "border-[#292929] bg-[#0A0A0A] hover:border-[#777777]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex size-10 items-center justify-center rounded-xl border ${
                          isSelected
                            ? "border-[#ED1C24] bg-[#ED1C24] text-white"
                            : "border-[#292929] bg-[#111111] text-[#ED1C24]"
                        }`}
                      >
                        <Icon size={18} />
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-white">{cat.title}</h3>
                        <p className="mt-0.5 line-clamp-2 text-[11px] text-[#777777]">{cat.desc}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => setStep(2)}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#ED1C24] py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#FF3038] transition"
            >
              <span>Continue with {selectedCategory}</span>
              <ArrowRight size={15} />
            </button>
          </div>
        ) : (
          /* STEP 2: REGISTRATION FORM */
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="rounded-xl border border-[#292929] bg-[#0A0A0A] px-3.5 py-2 text-xs flex items-center justify-between">
              <span className="text-[#777777]">Selected Category:</span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#ED1C24]">{selectedCategory}</span>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-[10px] text-[#BDBDBD] underline hover:text-white"
                >
                  Change
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-[#BDBDBD] block mb-1.5">Lead Contact Name</label>
                <input
                  type="text"
                  required
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full rounded-xl border border-[#292929] bg-[#0A0A0A] p-2.5 text-xs text-white focus:border-[#ED1C24] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#BDBDBD] block mb-1.5">Organization / Venue Name</label>
                <input
                  type="text"
                  required
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  placeholder="e.g. Smash Turf Arena"
                  className="w-full rounded-xl border border-[#292929] bg-[#0A0A0A] p-2.5 text-xs text-white focus:border-[#ED1C24] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-[#BDBDBD] block mb-1.5">Official Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="organizer@venue.com"
                  className="w-full rounded-xl border border-[#292929] bg-[#0A0A0A] p-2.5 text-xs text-white focus:border-[#ED1C24] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#BDBDBD] block mb-1.5">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full rounded-xl border border-[#292929] bg-[#0A0A0A] p-2.5 text-xs text-white focus:border-[#ED1C24] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-[#BDBDBD] block mb-1.5">Secure Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    className="w-full rounded-xl border border-[#292929] bg-[#0A0A0A] p-2.5 pr-9 text-xs text-white focus:border-[#ED1C24] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-[#777777] hover:text-white"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#BDBDBD] block mb-1.5">Confirm Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full rounded-xl border border-[#292929] bg-[#0A0A0A] p-2.5 text-xs text-white focus:border-[#ED1C24] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="rounded-xl border border-[#292929] bg-[#171717] px-4 py-3 text-xs font-bold uppercase text-[#BDBDBD] hover:text-white"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-xl bg-[#ED1C24] py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#FF3038] disabled:opacity-50"
              >
                {loading ? "Submitting Organizer Application..." : "Submit Organizer Application"}
              </button>
            </div>
          </form>
        )}

        <div className="mt-8 border-t border-[#292929] pt-6 text-center text-xs text-[#777777]">
          <span>Already registered? </span>
          <Link to="/organizer/login" className="font-bold text-[#ED1C24] hover:underline">
            Organizer Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
