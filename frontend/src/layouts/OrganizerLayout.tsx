import { useState, type ReactNode } from "react";
import { NavLink, useNavigate, Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Calendar,
  Layers,
  Ticket,
  BarChart3,
  MessageSquare,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Plus,
  Trophy,
  Film,
  Music,
  Laugh,
  BookOpen,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export type OrganizerCategory =
  | "Sports Organizer"
  | "Cinema Organizer"
  | "Concert Organizer"
  | "Comedy Organizer"
  | "Workshop Organizer"
  | "General Event Organizer";

interface CategoryMeta {
  raw: string;
  label: OrganizerCategory;
  short: string;
  icon: typeof Trophy;
}

const CATEGORY_MAP: Record<string, CategoryMeta> = {
  sports: { raw: "Sports", label: "Sports Organizer", short: "Sports", icon: Trophy },
  cinema: { raw: "Cinema / Theatre", label: "Cinema Organizer", short: "Cinema", icon: Film },
  theatre: { raw: "Cinema / Theatre", label: "Cinema Organizer", short: "Cinema", icon: Film },
  concert: { raw: "Concert", label: "Concert Organizer", short: "Concert", icon: Music },
  comedy: { raw: "Comedy", label: "Comedy Organizer", short: "Comedy", icon: Laugh },
  workshop: { raw: "Workshop", label: "Workshop Organizer", short: "Workshop", icon: BookOpen },
  general: { raw: "General Events", label: "General Event Organizer", short: "General Events", icon: Sparkles },
};

export function resolveOrganizerCategory(name?: string, categoryField?: string): CategoryMeta {
  if (categoryField) {
    const key = categoryField.toLowerCase();
    for (const [k, meta] of Object.entries(CATEGORY_MAP)) {
      if (key.includes(k)) return meta;
    }
  }

  if (name) {
    const match = /\[(.*?)\]/.exec(name);
    if (match && match[1]) {
      const tag = match[1].toLowerCase();
      for (const [k, meta] of Object.entries(CATEGORY_MAP)) {
        if (tag.includes(k)) return meta;
      }
    }
  }

  return { raw: "Sports", label: "Sports Organizer", short: "Sports", icon: Trophy };
}

const sidebarNavItems = [
  { label: "Overview", to: "/organizer/dashboard", icon: LayoutDashboard },
  { label: "My Listings", to: "/organizer/events", icon: Layers },
  { label: "Bookings", to: "/organizer/bookings", icon: Ticket },
  { label: "Calendar", to: "/organizer/calendar", icon: Calendar },
  { label: "Revenue & Reports", to: "/organizer/reports", icon: BarChart3 },
  { label: "Messages", to: "/organizer/messages", icon: MessageSquare, badge: "4" },
  { label: "Team", to: "/organizer/team", icon: Users },
  { label: "Settings", to: "/organizer/settings", icon: Settings },
];

export default function OrganizerLayout({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Derive breadcrumbs based on route
  const currentPath = location.pathname;
  let pageTitle = "Overview";
  if (currentPath.includes("/events/create")) pageTitle = "Add New Listing";
  else if (currentPath.includes("/events/")) pageTitle = "Edit Listing";
  else if (currentPath.includes("/events")) pageTitle = "My Listings";
  else if (currentPath.includes("/bookings")) pageTitle = "Bookings";
  else if (currentPath.includes("/calendar")) pageTitle = "Calendar";
  else if (currentPath.includes("/reports")) pageTitle = "Revenue & Reports";
  else if (currentPath.includes("/messages")) pageTitle = "Messages";
  else if (currentPath.includes("/team")) pageTitle = "Team";
  else if (currentPath.includes("/settings")) pageTitle = "Settings";

  // Derive permanent assigned category from user profile
  const categoryMeta = resolveOrganizerCategory(user?.name, user?.organizerCategory);
  const CategoryIcon = categoryMeta.icon;

  // Derive initial & clean name
  const rawName = user?.name || "Smash Sports Arena";
  const displayName = rawName.split("(")[0].replace(/\[.*?\]/g, "").trim() || "Smash Sports Arena";
  const userInitial = displayName.charAt(0).toUpperCase() || "O";

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between bg-[#0D0D0D] text-white">
      <div>
        {/* Brand Header */}
        <div className="px-6 pt-6 pb-5">
          <div className="flex items-center justify-between">
            <Link to="/organizer/dashboard" className="flex items-baseline gap-1 group">
              <span className="font-display text-2xl font-black uppercase tracking-wider text-white">
                EVENT<span className="text-[#F51D2B]">X</span>
              </span>
            </Link>
            {mobileOpen && (
              <button
                onClick={() => setMobileOpen(false)}
                className="grid size-8 place-items-center rounded-lg text-[#A1A1AA] hover:bg-[#141414] lg:hidden"
              >
                <X size={18} />
              </button>
            )}
          </div>
          <p className="mt-1 text-[11px] font-medium tracking-wide text-[#A1A1AA]">
            Organizer Portal
          </p>
        </div>

        {/* Permanent Non-Editable Category Badge */}
        <div className="px-4 mb-4">
          <p className="px-2 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-[#777777]">
            Organizer Type
          </p>
          <div className="flex w-full items-center gap-2.5 rounded-xl border border-[#292929] bg-[#141414] px-3.5 py-2.5 text-xs font-bold text-white shadow-inner">
            <div className="grid size-6 place-items-center rounded-lg bg-[#F51D2B]/10 text-[#F51D2B]">
              <CategoryIcon size={14} />
            </div>
            <span className="truncate tracking-wide">{categoryMeta.label}</span>
          </div>
        </div>

        {/* Main Navigation Items */}
        <nav className="space-y-1 px-3" aria-label="Organizer Navigation">
          {sidebarNavItems.map(({ label, to, icon: Icon, badge }) => (
            <NavLink
              key={label}
              to={to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `group relative flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold transition ${
                  isActive
                    ? "bg-[#F51D2B] text-white shadow-lg shadow-[#F51D2B]/25"
                    : "text-[#A1A1AA] hover:bg-[#141414] hover:text-white"
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon size={16} />
                <span>{label}</span>
              </div>
              {badge && (
                <span className="grid size-4 place-items-center rounded-full bg-[#F51D2B] text-[10px] font-bold text-white group-[.bg-\[\#F51D2B\]]:bg-white group-[.bg-\[\#F51D2B\]]:text-[#F51D2B]">
                  {badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* User Profile & Sign Out Footer */}
      <div className="border-t border-[#292929] p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="grid size-9 shrink-0 place-items-center rounded-full bg-[#F51D2B] font-display text-sm font-bold text-white shadow-md">
              {userInitial}
            </div>
            <div className="truncate">
              <p className="truncate text-xs font-bold text-white">{displayName}</p>
              <p className="truncate text-[10px] text-[#A1A1AA]">{categoryMeta.label}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Log Out"
            className="grid size-8 shrink-0 place-items-center rounded-lg text-[#A1A1AA] transition hover:bg-[#141414] hover:text-white"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#080808] text-white">
      {/* Desktop Fixed Left Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-[#292929] bg-[#0D0D0D] lg:block">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 w-64 shadow-2xl">
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Main Wrapper */}
      <div className="min-h-screen flex flex-col lg:pl-64">
        {/* Top Navigation Bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#292929] bg-[#080808]/90 px-4 sm:px-8 backdrop-blur">
          {/* Left: Breadcrumbs & Mobile Menu */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="grid size-9 place-items-center rounded-lg border border-[#292929] bg-[#141414] text-[#A1A1AA] hover:text-white lg:hidden"
            >
              <Menu size={16} />
            </button>
            <div className="flex items-center gap-2 text-xs">
              <Link to="/organizer/dashboard" className="text-[#A1A1AA] hover:text-white transition">
                Organizer
              </Link>
              <span className="text-[#777777]">/</span>
              <span className="font-semibold text-white">{pageTitle}</span>
            </div>
          </div>

          {/* Right: Static Category Indicator, Notifications, Add New Listing Button */}
          <div className="flex items-center gap-3">
            {/* Static Permanent Category Pill (Non-switchable) */}
            <div className="hidden sm:flex items-center gap-2 rounded-xl border border-[#292929] bg-[#141414] px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm">
              <CategoryIcon size={14} className="text-[#F51D2B]" />
              <span>{categoryMeta.label}</span>
            </div>

            {/* Notification Bell */}
            <button
              title="Notifications"
              className="relative grid size-9 place-items-center rounded-xl border border-[#292929] bg-[#141414] text-[#A1A1AA] transition hover:text-white hover:border-[#3a3a3a]"
            >
              <Bell size={16} />
              <span className="absolute top-2 right-2 size-2 rounded-full bg-[#F51D2B]" />
            </button>

            {/* Add New Listing Button */}
            <Link
              to="/organizer/events/create"
              className="flex items-center gap-1.5 rounded-xl bg-[#F51D2B] px-4 py-2 text-xs font-bold text-white shadow-md shadow-[#F51D2B]/20 transition hover:bg-[#ff2b39]"
            >
              <Plus size={15} />
              <span className="hidden sm:inline">Add New Listing</span>
              <span className="sm:hidden">Add</span>
            </Link>
          </div>
        </header>

        {/* Dashboard Content Container */}
        <main className="flex-1 p-4 sm:p-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
