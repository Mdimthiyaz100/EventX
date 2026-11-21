import { Link } from "react-router-dom";
import { ArrowRight, Film, Layers, Building2, Ticket } from "lucide-react";

export default function PortalLanding() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#000000] text-white flex flex-col justify-between selection:bg-[#ED1C24] selection:text-white">
      {/* Background cinematic atmosphere */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Dark stage / cinema atmosphere backdrop */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-25 scale-105 filter blur-[1px] brightness-75"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=2400&q=85')`,
          }}
        />

        {/* Ambient colored lighting glows */}
        <div className="absolute -top-32 -left-32 h-[550px] w-[550px] rounded-full bg-[#ED1C24]/20 blur-[130px]" />
        <div className="absolute -top-32 right-1/4 h-[550px] w-[550px] rounded-full bg-[#ED1C24]/10 blur-[130px]" />
        <div className="absolute -top-32 -right-32 h-[550px] w-[550px] rounded-full bg-purple-600/20 blur-[130px]" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[400px] w-full max-w-5xl rounded-full bg-[#ED1C24]/10 blur-[150px]" />

        {/* Dramatic Vignette Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#000000]/90 via-[#000000]/60 to-[#000000]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-[#000000]/50 to-[#000000]" />

        {/* Cinematic Film Reel & Microphone Props in corners */}
        <div className="hidden lg:block absolute left-8 top-1/4 opacity-15 rotate-[-12deg] pointer-events-none">
          <div className="size-48 rounded-full border-[10px] border-dashed border-white/20 flex items-center justify-center">
            <div className="size-20 rounded-full border-4 border-white/30" />
          </div>
        </div>
        <div className="hidden lg:block absolute right-12 bottom-20 opacity-20 rotate-[15deg] pointer-events-none">
          <div className="flex items-center gap-2 border-2 border-dashed border-[#ED1C24]/30 px-6 py-4 rounded-xl text-red-300 font-mono text-xl tracking-widest uppercase">
            <Ticket size={24} />
            <span>TICKET VIP</span>
          </div>
        </div>
      </div>

      {/* Top Header / Navigation */}
      <header className="relative z-20 flex h-20 items-center justify-between px-6 sm:px-12 lg:px-20 max-w-7xl mx-auto w-full">
        <Link
          to="/"
          className="font-display text-3xl sm:text-4xl font-black uppercase tracking-tight text-white transition hover:opacity-90"
        >
          EVENT<span className="text-[#ED1C24]">X</span>
        </Link>

        <nav className="flex items-center gap-6 sm:gap-10 text-xs sm:text-sm font-semibold text-[#BDBDBD]">
          <Link to="/movies" className="transition hover:text-white">
            Movies
          </Link>
          <Link to="/events" className="transition hover:text-white">
            Events
          </Link>
          <Link to="/#about" className="transition hover:text-white">
            About
          </Link>
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-8 py-8 sm:py-12 max-w-7xl mx-auto w-full">
        {/* Eyebrow badge */}
        <div className="flex items-center gap-3 mb-4">
          <div className="h-[1px] w-8 sm:w-14 bg-[#ED1C24]" />
          <span className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.25em] text-[#BDBDBD]">
            Welcome to EventX
          </span>
          <div className="h-[1px] w-8 sm:w-14 bg-[#ED1C24]" />
        </div>

        {/* Central Headline */}
        <h1 className="text-center font-display text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-tight leading-none text-white max-w-4xl">
          ONE PLATFORM FOR <br className="hidden sm:inline" />
          <span className="text-[#ED1C24]">MOVIES, EVENTS & MORE</span>
        </h1>

        <p className="mt-4 text-center text-xs sm:text-base font-normal text-[#BDBDBD] max-w-2xl px-2">
          Book tickets, manage facilities, organize events, and explore entertainment — all in one place.
        </p>

        {/* Portal Selection Cards: 3-Column Responsive Grid (User, Organizer, Admin) */}
        <div className="mt-10 sm:mt-14 grid w-full grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl">
          {/* Card 1: User Login (EventX Red Theme) */}
          <div className="group relative rounded-3xl border border-[#ED1C24]/35 bg-gradient-to-b from-[#180C14]/90 to-[#111111]/90 p-8 shadow-[0_0_50px_rgba(237,28,36,0.15)] backdrop-blur-xl transition-all duration-300 hover:border-[#ED1C24] hover:shadow-[0_0_60px_rgba(237,28,36,0.3)] hover:-translate-y-1 flex flex-col justify-between overflow-hidden">
            <div className="absolute top-0 right-0 size-36 bg-[#ED1C24]/10 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center text-center">
              {/* Icon Container */}
              <div className="mb-6 flex size-16 items-center justify-center rounded-2xl border border-[#ED1C24]/30 bg-[#ED1C24]/10 text-[#ED1C24] shadow-inner group-hover:scale-105 transition-transform duration-300">
                <Film size={28} className="stroke-[1.8]" />
              </div>

              {/* Title & Description */}
              <h2 className="font-display text-2xl font-extrabold uppercase tracking-tight text-white">
                User Login
              </h2>
              <p className="mt-3 text-xs leading-relaxed text-[#BDBDBD] max-w-xs">
                Book tickets, explore movies, sports facilities & events, manage your bookings.
              </p>
            </div>

            {/* Button */}
            <div className="relative z-10 mt-8">
              <Link
                to="/login"
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#ED1C24] py-3.5 text-xs font-extrabold uppercase tracking-wider text-white shadow-lg shadow-[#ED1C24]/30 transition-all duration-200 hover:bg-[#FF3038] active:scale-[0.98]"
              >
                <span>Login as User</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          {/* Card 2: Organizer Portal (Brand Red/Crimson Accent) */}
          <div className="group relative rounded-3xl border border-[#ED1C24]/40 bg-gradient-to-b from-[#1C0E12]/90 to-[#111111]/90 p-8 shadow-[0_0_50px_rgba(237,28,36,0.18)] backdrop-blur-xl transition-all duration-300 hover:border-[#ED1C24] hover:shadow-[0_0_60px_rgba(237,28,36,0.35)] hover:-translate-y-1 flex flex-col justify-between overflow-hidden">
            <div className="absolute top-0 right-0 size-36 bg-[#ED1C24]/15 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center text-center">
              {/* Icon Container */}
              <div className="mb-6 flex size-16 items-center justify-center rounded-2xl border border-[#ED1C24]/40 bg-[#ED1C24]/15 text-[#ED1C24] shadow-inner group-hover:scale-105 transition-transform duration-300">
                <Building2 size={28} className="stroke-[1.8]" />
              </div>

              {/* Title & Description */}
              <h2 className="font-display text-2xl font-extrabold uppercase tracking-tight text-white">
                Organizer Portal
              </h2>
              <p className="mt-3 text-xs leading-relaxed text-[#BDBDBD] max-w-xs">
                List sports facilities, turf grounds, cinema screens, comedy shows and concert tours.
              </p>
            </div>

            {/* Buttons */}
            <div className="relative z-10 mt-8 space-y-2">
              <Link
                to="/organizer/login"
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#ED1C24] py-3.5 text-xs font-extrabold uppercase tracking-wider text-white shadow-lg shadow-[#ED1C24]/30 transition-all duration-200 hover:bg-[#FF3038] active:scale-[0.98]"
              >
                <span>Login as Organizer</span>
                <ArrowRight size={16} />
              </Link>
              <Link
                to="/organizer/register"
                className="flex w-full items-center justify-center gap-1.5 rounded-2xl border border-[#292929] bg-[#0A0A0A] py-2.5 text-[11px] font-bold uppercase tracking-wider text-[#BDBDBD] hover:text-white hover:border-[#ED1C24] transition"
              >
                <span>Register Venue / Business &rarr;</span>
              </Link>
            </div>
          </div>

          {/* Card 3: Admin Login (Elevated Purple/Deep Indigo Theme) */}
          <div className="group relative rounded-3xl border border-purple-500/35 bg-gradient-to-b from-[#130E24]/90 to-[#0C081A]/90 p-8 shadow-[0_0_50px_rgba(147,51,234,0.15)] backdrop-blur-xl transition-all duration-300 hover:border-purple-500/60 hover:shadow-[0_0_60px_rgba(147,51,234,0.3)] hover:-translate-y-1 flex flex-col justify-between overflow-hidden">
            <div className="absolute top-0 right-0 size-36 bg-purple-600/10 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center text-center">
              {/* Icon Container */}
              <div className="mb-6 flex size-16 items-center justify-center rounded-2xl border border-purple-500/30 bg-purple-500/10 text-purple-400 shadow-inner group-hover:scale-105 transition-transform duration-300">
                <Layers size={28} className="stroke-[1.8]" />
              </div>

              {/* Title & Description */}
              <h2 className="font-display text-2xl font-extrabold uppercase tracking-tight text-white">
                Admin Login
              </h2>
              <p className="mt-3 text-xs leading-relaxed text-[#BDBDBD] max-w-xs">
                Platform administration, organizer verification, content moderation, reports & analytics.
              </p>
            </div>

            {/* Button */}
            <div className="relative z-10 mt-8">
              <Link
                to="/admin/login"
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#6342E8] py-3.5 text-xs font-extrabold uppercase tracking-wider text-white shadow-lg shadow-purple-600/30 transition-all duration-200 hover:bg-[#5233d6] active:scale-[0.98]"
              >
                <span>Login as Admin</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>

        {/* Return to website link */}
        <div className="mt-10 text-center">
          <Link
            to="/"
            className="text-xs font-semibold text-[#777777] hover:text-white transition underline underline-offset-4"
          >
            &larr; Continue to EventX Homepage without signing in
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full border-t border-[#292929] py-4 text-center text-[11px] text-[#777777]">
        <span>© 2026 EventX Inc. All rights reserved.</span>
      </footer>
    </div>
  );
}
