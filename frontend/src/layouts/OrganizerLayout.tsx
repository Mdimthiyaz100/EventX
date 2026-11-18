import { useState, type ReactNode } from "react";
import { NavLink, useNavigate, Link } from "react-router-dom";
import {
  LayoutDashboard,
  Calendar,
  PlusCircle,
  Ticket,
  QrCode,
  User,
  LogOut,
  Menu,
  X,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { label: "Dashboard", to: "/organizer/dashboard", icon: LayoutDashboard },
  { label: "My Events", to: "/organizer/events", icon: Calendar },
  { label: "Create Event", to: "/organizer/events/create", icon: PlusCircle },
  { label: "Bookings & Tickets", to: "/organizer/bookings", icon: Ticket },
  { label: "Entry Check-in", to: "/organizer/tickets", icon: QrCode },
  { label: "Organizer Profile", to: "/organizer/profile", icon: User },
];

export default function OrganizerLayout({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between bg-[#121216] text-white">
      <div>
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center justify-between">
            <Link to="/organizer/dashboard" className="flex items-center gap-1.5 focus:outline-none">
              <span className="font-display text-2xl font-black uppercase tracking-tight text-white">
                Event<span className="text-[#E31824]">X</span>
              </span>
            </Link>
            {mobileOpen && (
              <button
                onClick={() => setMobileOpen(false)}
                className="grid size-8 place-items-center rounded-lg text-white/60 hover:bg-white/10 lg:hidden"
              >
                <X size={18} />
              </button>
            )}
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span className="inline-block rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold tracking-wide text-emerald-400">
              Organizer Portal
            </span>
          </div>
        </div>

        <nav className="space-y-1 p-4" aria-label="Organizer Navigation">
          {navItems.map(({ label, to, icon: Icon }) => (
            <NavLink
              key={label}
              to={to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-xl px-4 py-2.5 text-xs font-semibold transition ${
                  isActive
                    ? "bg-[#E31824] text-white shadow-md shadow-[#E31824]/20"
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                }`
              }
            >
              <Icon size={16} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="border-t border-white/5 p-4 space-y-2">
        <Link
          to="/"
          target="_blank"
          className="flex items-center gap-2.5 rounded-xl px-4 py-2 text-xs font-medium text-white/50 hover:bg-white/5 hover:text-white"
        >
          <ExternalLink size={14} />
          <span>View Public Site</span>
        </Link>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2.5 rounded-xl px-4 py-2 text-xs font-medium text-red-400 hover:bg-red-500/10"
        >
          <LogOut size={14} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0C0C0E] text-white">
      {/* Desktop Persistent Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-white/5 lg:block">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 w-64 shadow-2xl">
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Main Content View */}
      <div className="min-h-screen flex flex-col lg:pl-64">
        {/* Mobile Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/5 bg-[#121216]/80 px-4 backdrop-blur lg:hidden">
          <button
            onClick={() => setMobileOpen(true)}
            className="grid size-10 place-items-center rounded-xl border border-white/10 bg-white/5 text-white/70 hover:text-white"
          >
            <Menu size={18} />
          </button>
          <span className="font-display text-lg font-bold uppercase text-white">
            Organizer Studio
          </span>
          <div className="size-10" />
        </header>

        <main className="flex-1 p-4 sm:p-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
