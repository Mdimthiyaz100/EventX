import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  MapPin,
  Search,
  ChevronDown,
  User,
  Heart,
  Ticket,
  LogOut,
  Menu,
  X,
  Sparkles,
  ShieldAlert,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useWishlist } from "../../context/WishlistContext";
import { apiGet } from "../../services/api";

export default function UserNavbar() {
  const { user, logout } = useAuth();
  const { wishlist } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();

  const [cities, setCities] = useState<string[]>(["Chennai", "Mumbai", "Bengaluru", "Delhi NCR", "Hyderabad"]);
  const [selectedCity, setSelectedCity] = useState("Chennai");
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let mounted = true;
    void apiGet("/cities").then((res) => {
      if (mounted && Array.isArray(res) && res.length > 0) {
        setCities(res as string[]);
        if (!res.includes(selectedCity)) {
          setSelectedCity(res[0] as string);
        }
      }
    }).catch(() => undefined);
    return () => {
      mounted = false;
    };
  }, [selectedCity]);

  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [searchOpen]);

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Events", href: "/events" },
    { label: "Movies", href: "/movies" },
    { label: "Comedy Shows", href: "/comedy" },
    { label: "Concerts", href: "/concerts" },
    { label: "Sports", href: "/sports" },
    { label: "Workshops", href: "/workshops" },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/events?search=${encodeURIComponent(searchQuery.trim())}&city=${encodeURIComponent(selectedCity)}`);
      setSearchOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#292929] bg-[#000000]/95 backdrop-blur-xl text-white">
      <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-4 sm:px-8 lg:px-12">
        {/* Brand Logo & Main Nav */}
        <div className="flex items-center gap-8">
          <Link
            to="/"
            className="flex items-center gap-1 font-display text-2xl sm:text-3xl font-black uppercase tracking-tight text-white transition hover:opacity-90"
          >
            EVENT<span className="text-[#ED1C24]">X</span>
          </Link>

          {/* Center Navigation Links matching reference screenshot */}
          <nav className="hidden xl:flex items-center gap-6 text-[13px] font-semibold tracking-wide text-[#BDBDBD]">
            {navLinks.map((link) => {
              const active =
                link.href === "/"
                  ? location.pathname === "/"
                  : location.pathname.startsWith(link.href);
              return (
                <Link
                  key={link.label}
                  to={link.href}
                  className={`relative py-1 transition hover:text-white ${
                    active ? "text-white font-bold" : "text-[#BDBDBD]"
                  }`}
                >
                  {link.label}
                  {active && (
                    <span className="absolute bottom-[-24px] left-0 h-[3px] w-full rounded-full bg-[#ED1C24]" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right side items: Location, Search, Wishlist, Get Tickets CTA, User */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Location Selector */}
          <div className="relative">
            <button
              onClick={() => setCityDropdownOpen((prev) => !prev)}
              className="flex items-center gap-1.5 rounded-full border border-[#292929] bg-[#111111] px-3.5 py-1.5 text-xs font-semibold text-[#FFFFFF] transition hover:border-[#ED1C24]/60"
            >
              <MapPin size={13} className="text-[#ED1C24]" />
              <span>{selectedCity}</span>
              <ChevronDown size={13} className="text-[#777777]" />
            </button>

            {cityDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-xl border border-[#292929] bg-[#111111] p-1.5 shadow-2xl shadow-black backdrop-blur-2xl z-50">
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#777777]">
                  Select Location
                </div>
                {cities.map((city) => (
                  <button
                    key={city}
                    onClick={() => {
                      setSelectedCity(city);
                      setCityDropdownOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition ${
                      selectedCity === city
                        ? "bg-[#ED1C24] text-white"
                        : "text-[#BDBDBD] hover:bg-[#171717] hover:text-white"
                    }`}
                  >
                    <span>{city}</span>
                    {selectedCity === city && <span className="size-1.5 rounded-full bg-white" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search Trigger */}
          <button
            onClick={() => setSearchOpen(true)}
            className="flex size-9 items-center justify-center rounded-full border border-[#292929] bg-[#111111] text-[#BDBDBD] transition hover:border-[#ED1C24]/60 hover:text-white"
            title="Global Search"
          >
            <Search size={15} />
          </button>

          {/* Wishlist Shortcut */}
          <Link
            to="/wishlist"
            className="relative flex size-9 items-center justify-center rounded-full border border-[#292929] bg-[#111111] text-[#BDBDBD] transition hover:border-[#ED1C24]/60 hover:text-[#ED1C24]"
            title="Favourites"
          >
            <Heart size={15} className={wishlist.length > 0 ? "fill-[#ED1C24] text-[#ED1C24]" : ""} />
            {wishlist.length > 0 && (
              <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-[#ED1C24] text-[9px] font-bold text-white">
                {wishlist.length}
              </span>
            )}
          </Link>

          {/* "Get Tickets" Action Pill as in screenshot */}
          <Link
            to="/events"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-[#ED1C24] px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-[#ED1C24]/20 transition hover:bg-[#FF3038] hover:shadow-[#ED1C24]/40"
          >
            <Ticket size={13} />
            <span>Get Tickets</span>
          </Link>

          {/* Profile / Auth Menu */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2 rounded-full border border-[#292929] bg-[#111111] p-1.5 pr-2.5 transition hover:border-[#ED1C24]/60"
              >
                <div className="flex size-7 items-center justify-center rounded-full bg-[#ED1C24] text-xs font-bold text-white">
                  {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                </div>
                <span className="hidden max-w-[100px] truncate text-xs font-semibold text-white md:inline">
                  {user.name.split(" ")[0]}
                </span>
                <ChevronDown size={13} className="text-[#777777]" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl border border-[#292929] bg-[#111111] p-1.5 shadow-2xl shadow-black backdrop-blur-2xl z-50">
                  <div className="border-b border-[#292929] px-3 py-2.5">
                    <p className="text-xs font-bold text-white">{user.name}</p>
                    <p className="truncate text-[11px] text-[#777777]">{user.email}</p>
                    <span className="mt-1 inline-block rounded bg-[#ED1C24]/20 px-2 py-0.5 text-[10px] font-bold uppercase text-[#ED1C24]">
                      {user.role}
                    </span>
                  </div>

                  <div className="py-1">
                    <Link
                      to="/my-bookings"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-[#BDBDBD] transition hover:bg-[#171717] hover:text-white"
                    >
                      <Ticket size={14} className="text-[#ED1C24]" />
                      My Bookings
                    </Link>
                    <Link
                      to="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-[#BDBDBD] transition hover:bg-[#171717] hover:text-white"
                    >
                      <User size={14} className="text-[#ED1C24]" />
                      Profile & Settings
                    </Link>
                    <Link
                      to="/rewards"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-[#BDBDBD] transition hover:bg-[#171717] hover:text-white"
                    >
                      <Sparkles size={14} className="text-[#ED1C24]" />
                      Rewards & EventX Pass
                    </Link>

                    {user.role === "ADMIN" && (
                      <Link
                        to="/admin/dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-[#ED1C24] transition hover:bg-[#171717]"
                      >
                        <ShieldAlert size={14} />
                        Admin Portal
                      </Link>
                    )}
                    {user.role === "ORGANIZER" && (
                      <Link
                        to="/organizer/dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-[#ED1C24] transition hover:bg-[#171717]"
                      >
                        <ShieldAlert size={14} />
                        Organizer Portal
                      </Link>
                    )}
                  </div>

                  <div className="border-t border-[#292929] pt-1">
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                      }}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-[#EF4444] transition hover:bg-[#171717]"
                    >
                      <LogOut size={14} />
                      Log Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="rounded-full border border-[#292929] bg-[#111111] px-4 py-1.5 text-xs font-semibold text-white transition hover:border-[#ED1C24]/60"
              >
                Sign In
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="flex size-9 items-center justify-center rounded-full border border-[#292929] bg-[#111111] text-white xl:hidden"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Global Search Overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/80 px-4 pt-20 backdrop-blur-md">
          <div className="relative w-full max-w-2xl rounded-2xl border border-[#292929] bg-[#111111] p-6 shadow-2xl">
            <button
              onClick={() => setSearchOpen(false)}
              className="absolute right-4 top-4 text-[#777777] transition hover:text-white"
            >
              <X size={20} />
            </button>

            <form onSubmit={handleSearchSubmit} className="mt-2">
              <div className="relative flex items-center">
                <Search size={20} className="absolute left-4 text-[#ED1C24]" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search events, movies, concerts, comedy, dining..."
                  className="w-full rounded-xl border border-[#292929] bg-[#0A0A0A] py-3.5 pl-12 pr-4 text-sm text-white placeholder-[#777777] focus:border-[#ED1C24] focus:outline-none"
                />
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-[#BDBDBD]">
                <span className="text-[#777777]">Popular:</span>
                {["Anirudh Live", "Jailer 2", "Stand-up Comedy", "Food Fest", "Turf Booking"].map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => {
                      setSearchQuery(term);
                      navigate(`/events?search=${encodeURIComponent(term)}&city=${encodeURIComponent(selectedCity)}`);
                      setSearchOpen(false);
                    }}
                    className="rounded-full border border-[#292929] bg-[#171717] px-2.5 py-1 text-[11px] hover:border-[#ED1C24] hover:text-white"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-b border-[#292929] bg-[#0A0A0A] px-4 py-6 xl:hidden">
          <nav className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-semibold text-[#BDBDBD] hover:bg-[#171717] hover:text-white"
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/rewards"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-semibold text-[#ED1C24] hover:bg-[#171717]"
            >
              EventX Pass & Rewards
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
