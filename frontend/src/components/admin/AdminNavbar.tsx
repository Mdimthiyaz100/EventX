import { Bell, ChevronDown, LogOut, Menu, Search, Settings, User } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

interface AdminNavbarProps {
  onMobileMenuToggle: () => void;
  onSearch?: (query: string) => void;
}

export default function AdminNavbar({ onMobileMenuToggle, onSearch }: AdminNavbarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchValue);
    } else if (searchValue.trim()) {
      navigate(`/admin/events?search=${encodeURIComponent(searchValue.trim())}`);
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return "MI";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const displayName = user?.name || "Mohamed Imthiyaz";
  const initials = getInitials(user?.name);
  const displayRole = user?.role === "ADMIN" ? "Super Admin" : user?.role || "Super Admin";

  return (
    <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between border-b border-[#ece6dc]/70 bg-white/95 px-5 backdrop-blur-md sm:px-8">
      {/* Left side: Mobile menu toggle + Brand label */}
      <div className="flex items-center gap-3.5">
        <button
          onClick={onMobileMenuToggle}
          className="grid size-10 place-items-center rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 lg:hidden"
          aria-label="Toggle navigation menu"
        >
          <Menu size={20} />
        </button>

        <div className="flex items-center gap-3">
          <Link to="/admin/dashboard" className="flex items-center font-display text-2xl font-extrabold uppercase tracking-tight text-[#171717]">
            Event<span className="text-[#E31824]">X</span>
          </Link>
          <span className="hidden text-sm font-medium text-slate-400 sm:inline-block">
            Admin Portal
          </span>
        </div>
      </div>

      {/* Center: Global Search Bar */}
      <form onSubmit={handleSearchSubmit} className="mx-4 hidden max-w-md flex-1 md:block lg:max-w-lg">
        <div className="relative flex items-center">
          <Search size={16} className="pointer-events-none absolute left-3.5 text-slate-400" />
          <input
            type="search"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search movies, events, bookings..."
            className="h-10 w-full rounded-full border border-slate-200 bg-[#FCF9F4] pl-9 pr-4 text-xs font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#E31824] focus:bg-white focus:ring-2 focus:ring-[#E31824]/10"
          />
        </div>
      </form>

      {/* Right side: Notification + Admin Profile */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Notifications Icon with red badge */}
        <button
          className="relative grid size-10 place-items-center rounded-full text-slate-600 transition hover:bg-slate-100"
          aria-label="View notifications"
          title="Notifications"
        >
          <Bell size={19} />
          <span className="absolute right-2.5 top-2.5 size-2 rounded-full bg-[#E31824] ring-2 ring-white" />
        </button>

        {/* Admin Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setProfileOpen((prev) => !prev)}
            className="flex items-center gap-2.5 rounded-full p-1 transition hover:bg-slate-100 sm:pr-2.5"
            aria-expanded={profileOpen}
          >
            {/* Red Circle Avatar */}
            <div className="grid size-9 place-items-center rounded-full bg-[#E31824] text-xs font-bold tracking-tight text-white shadow-sm shadow-[#E31824]/30">
              {initials}
            </div>

            {/* Name & Subtitle */}
            <div className="hidden text-left sm:block">
              <span className="block text-xs font-bold leading-tight text-slate-900">
                {displayName}
              </span>
              <span className="block text-[11px] leading-tight text-slate-400">
                {displayRole}
              </span>
            </div>

            <ChevronDown size={14} className="text-slate-400 transition-transform duration-150" />
          </button>

          {/* Dropdown Menu */}
          {profileOpen && (
            <div className="absolute right-0 top-12 z-50 w-56 rounded-2xl border border-slate-200/90 bg-white p-2 shadow-xl animate-in fade-in zoom-in-95">
              <div className="border-b border-slate-100 px-3 py-2.5">
                <p className="text-xs font-bold text-slate-900">{displayName}</p>
                <p className="truncate text-[11px] text-slate-500">{user?.email || "admin@eventx.com"}</p>
                <span className="mt-1.5 inline-block rounded-md bg-red-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#E31824]">
                  {displayRole}
                </span>
              </div>

              <div className="py-1">
                <Link
                  to="/admin/settings"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                >
                  <User size={15} />
                  <span>Admin Profile</span>
                </Link>
                <Link
                  to="/admin/settings"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                >
                  <Settings size={15} />
                  <span>Portal Settings</span>
                </Link>
              </div>

              <div className="border-t border-slate-100 pt-1">
                <button
                  onClick={() => {
                    setProfileOpen(false);
                    logout();
                    navigate("/admin/login");
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-bold text-red-600 hover:bg-red-50"
                >
                  <LogOut size={15} />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
