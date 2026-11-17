import { NavLink, useNavigate } from "react-router-dom";
import {
  BarChart3,
  Calendar,
  Film,
  Home,
  Layers,
  LogOut,
  Mic,
  Settings,
  Ticket,
  Users,
  Utensils,
  X,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

interface SidebarProps {
  onMobileClose?: () => void;
  mobileOpen?: boolean;
}

export const navItems = [
  { label: "Dashboard", to: "/admin/dashboard", altTo: "/admin", icon: Home },
  { label: "Movies", to: "/admin/movies", icon: Film },
  { label: "Events", to: "/admin/events", icon: Calendar },
  { label: "Comedy Shows", to: "/admin/comedy", icon: Mic },
  { label: "Dining", to: "/admin/dining", icon: Utensils },
  { label: "Categories", to: "/admin/categories", icon: Layers },
  { label: "Bookings", to: "/admin/bookings", icon: Ticket },
  { label: "Users", to: "/admin/users", icon: Users },
  { label: "Reports", to: "/admin/reports", icon: BarChart3 },
  { label: "Settings", to: "/admin/settings", icon: Settings },
];

export default function AdminSidebar({ onMobileClose, mobileOpen = false }: SidebarProps) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between overflow-y-auto bg-[#111111] text-white">
      {/* Top Header */}
      <div>
        <div className="p-6 pb-5">
          <div className="flex items-center justify-between">
            <NavLink to="/admin/dashboard" className="flex items-center gap-1.5 focus:outline-none">
              <span className="font-display text-3xl font-black uppercase tracking-tight text-white">
                Event<span className="text-[#E31824]">X</span>
              </span>
            </NavLink>
            {onMobileClose && (
              <button
                onClick={onMobileClose}
                className="grid size-8 place-items-center rounded-lg text-white/60 hover:bg-white/10 hover:text-white lg:hidden"
                aria-label="Close navigation"
              >
                <X size={18} />
              </button>
            )}
          </div>
          <div className="mt-2.5">
            <span className="inline-block rounded-full bg-[#E31824] px-3.5 py-0.5 text-[11px] font-bold tracking-wide text-white shadow-sm shadow-[#E31824]/30">
              Admin Portal
            </span>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="space-y-1 px-4 py-2" aria-label="Admin Navigation">
          {navItems.map(({ label, to, altTo, icon: Icon }) => (
            <NavLink
              key={label}
              to={to}
              onClick={onMobileClose}
              className={({ isActive }) => {
                const currentPath = window.location.pathname;
                const isItemActive =
                  isActive ||
                  (altTo && (currentPath === altTo || currentPath === `${altTo}/`));
                return `group flex items-center gap-3.5 rounded-xl px-4 py-2.5 text-[13px] font-semibold transition-all duration-150 ${
                  isItemActive
                    ? "bg-[#E31824] text-white shadow-md shadow-[#E31824]/25"
                    : "text-white/80 hover:bg-white/5 hover:text-white"
                }`;
              }}
            >
              {({ isActive }) => {
                const currentPath = window.location.pathname;
                const isItemActive =
                  isActive ||
                  (altTo && (currentPath === altTo || currentPath === `${altTo}/`));
                return (
                  <>
                    <Icon
                      size={18}
                      className={isItemActive ? "text-white" : "text-white/70 group-hover:text-white"}
                    />
                    <span>{label}</span>
                  </>
                );
              }}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Bottom Area: Silhouette concert crowd image & Logout */}
      <div className="relative mt-4">
        {/* Cinematic Crowd Silhouette with Red Glow */}
        <div className="relative h-28 w-full overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80"
            alt=""
            aria-hidden="true"
            className="size-full object-cover object-bottom opacity-40 mix-blend-screen"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-[#111111]/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#111111] to-transparent" />
        </div>

        {/* Logout button */}
        <div className="p-4 pt-1">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-[13px] font-semibold text-white/80 transition hover:bg-white/10 hover:text-white"
          >
            <LogOut size={18} className="text-white/70" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[250px] shadow-2xl lg:block">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop and Sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={onMobileClose}
            aria-hidden="true"
          />
          <div className="fixed inset-y-0 left-0 z-50 w-[260px] shadow-2xl transition-transform duration-300">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
