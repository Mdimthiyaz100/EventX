import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { MapPin, Search, ChevronDown, User, Heart, Ticket, LogOut, Menu, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useWishlist } from "../../context/WishlistContext";

export const CITY_OPTIONS = [
  "Chennai",
  "Mumbai",
  "Bengaluru",
  "Delhi NCR",
  "Hyderabad",
  "Kolkata",
  "Pune",
  "Kochi",
];

export default function UserNavbar() {
  const { user, logout } = useAuth();
  const { wishlist } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedCity, setSelectedCity] = useState("Chennai");
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Events", href: "/events" },
    { label: "Comedy Shows", href: "/category/Comedy Shows" },
    { label: "Movies", href: "/movies" },
    { label: "Concerts", href: "/category/Concerts" },
    { label: "Theatre", href: "/category/Theatre" },
    { label: "Sports", href: "/category/Sports" },
    { label: "Workshops", href: "/category/Workshops" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#0D0B14]/95 backdrop-blur-xl text-white">
      <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-4 sm:px-8 lg:px-12">
        {/* Brand Logo */}
        <div className="flex items-center gap-8">
          <Link
            to="/"
            className="font-display text-2xl sm:text-3xl font-black uppercase tracking-tight text-white transition hover:opacity-90"
          >
            Event<span className="text-[#E31824]">X</span>
          </Link>

          {/* Desktop Navigation links */}
          <nav className="hidden xl:flex items-center gap-6 text-[13px] font-semibold text-slate-300">
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
                    active ? "text-white font-bold" : "text-slate-400"
                  }`}
                >
                  {link.label}
                  {active && (
                    <span className="absolute bottom-[-16px] left-0 h-[3px] w-full rounded-full bg-[#E31824]" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right side items */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Location Selector */}
          <div className="relative">
            <button
              onClick={() => setCityDropdownOpen((prev) => !prev)}
              className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:bg-white/10 hover:border-white/20"
            >
              <MapPin size={13} className="text-[#E31824]" />
              <span>{selectedCity}</span>
              <ChevronDown size={13} className="text-slate-400" />
            </button>

            {cityDropdownOpen && (
              <div className="absolute right-0 mt-2 w-44 rounded-xl border border-white/10 bg-[#161224] p-1.5 shadow-2xl shadow-black backdrop-blur-2xl z-50">
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Select Location
                </div>
                {CITY_OPTIONS.map((city) => (
                  <button
                    key={city}
                    onClick={() => {
                      setSelectedCity(city);
                      setCityDropdownOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold transition ${
                      selectedCity === city
                        ? "bg-[#E31824] text-white"
                        : "text-slate-300 hover:bg-white/10"
                    }`}
                  >
                    <span>{city}</span>
                    {selectedCity === city && <span className="text-[10px]">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search Shortcut Icon */}
          <button
            onClick={() => {
              const searchInput = document.getElementById("main-search-input");
              if (searchInput) {
                searchInput.focus();
                searchInput.scrollIntoView({ behavior: "smooth", block: "center" });
              } else {
                navigate("/events");
              }
            }}
            className="grid size-9 place-items-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10 hover:text-white"
            title="Search events"
          >
            <Search size={15} />
          </button>

          {/* Wishlist Link */}
          <Link
            to="/wishlist"
            className="relative grid size-9 place-items-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10 hover:text-white"
            title="Saved Items"
          >
            <Heart size={15} className={wishlist.length ? "fill-[#E31824] text-[#E31824]" : ""} />
            {wishlist.length > 0 && (
              <span className="absolute -top-1 -right-1 grid size-4 place-items-center rounded-full bg-[#E31824] text-[9px] font-bold text-white">
                {wishlist.length}
              </span>
            )}
          </Link>

          {/* CTA: Get Tickets */}
          <Link
            to="/events"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-[#E31824] px-4 py-2 text-xs font-bold text-white shadow-md shadow-red-600/30 transition hover:bg-[#c8141f] active:scale-95"
          >
            <span>Get tickets</span>
            <span className="text-sm leading-none">&rarr;</span>
          </Link>

          {/* User Account Menu */}
          <div className="relative">
            <button
              onClick={() => setUserDropdownOpen((prev) => !prev)}
              className="grid size-9 place-items-center rounded-full border border-white/10 bg-white/10 text-slate-200 transition hover:border-[#E31824] hover:bg-white/20"
              title="Account"
            >
              {user?.name ? (
                <span className="text-xs font-black uppercase text-red-400">
                  {user.name.charAt(0)}
                </span>
              ) : (
                <User size={16} />
              )}
            </button>

            {userDropdownOpen && (
              <div className="absolute right-0 mt-2 w-52 rounded-xl border border-white/10 bg-[#161224] p-1.5 shadow-2xl shadow-black z-50">
                {user ? (
                  <>
                    <div className="border-b border-white/10 px-3 py-2.5">
                      <p className="text-xs font-bold text-white truncate">{user.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                      <span className="mt-1 inline-block rounded-md bg-white/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-red-400">
                        {user.role}
                      </span>
                    </div>

                    <Link
                      to="/my-bookings"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-white/10"
                    >
                      <Ticket size={14} className="text-[#E31824]" />
                      <span>My Bookings</span>
                    </Link>

                    {user.role === "ADMIN" && (
                      <Link
                        to="/admin/dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-red-300 transition hover:bg-red-500/10"
                      >
                        <span>⚙ Admin Portal</span>
                      </Link>
                    )}

                    <button
                      onClick={async () => {
                        setUserDropdownOpen(false);
                        await logout();
                        navigate("/");
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-red-400 transition hover:bg-red-500/10"
                    >
                      <LogOut size={14} />
                      <span>Sign Out</span>
                    </button>
                  </>
                ) : (
                  <>
                    <div className="px-3 py-2 text-[11px] text-slate-400">
                      Sign in to book tickets and manage your profile.
                    </div>
                    <Link
                      to="/choose-portal"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#E31824] px-3 py-2 text-xs font-bold text-white shadow-md transition hover:bg-[#c8141f]"
                    >
                      <span>Sign In</span>
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Mobile hamburger toggle */}
          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="grid size-9 place-items-center rounded-lg border border-white/10 bg-white/5 xl:hidden text-slate-300 hover:text-white"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="border-t border-white/10 bg-[#100C1B] px-5 py-4 xl:hidden">
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-200 hover:bg-white/10"
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-3 border-t border-white/10 pt-3 flex flex-col gap-2">
              <Link
                to="/my-bookings"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-slate-200 hover:bg-white/10"
              >
                <Ticket size={16} className="text-[#E31824]" />
                <span>My Bookings</span>
              </Link>
              <Link
                to="/choose-portal"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center rounded-lg bg-[#E31824] px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-white"
              >
                Sign In to EventX
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
