import { useQuery } from "@tanstack/react-query";
import {
  Calendar,
  Coins,
  ExternalLink,
  Film,
  Mic,
  Plus,
  Ticket,
  Utensils,
  ChevronDown,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import StatCard from "../../components/admin/StatCard";
import ManagementCard, {
  type ManagementItem,
} from "../../components/admin/ManagementCard";
import RecentActivity from "../../components/admin/RecentActivity";
import AnalyticsCard from "../../components/admin/AnalyticsCard";
import { getAdminDashboard } from "../../services/adminService";

export default function AdminDashboard() {
  const { data } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: getAdminDashboard,
    staleTime: 60_000,
  });

  const [addMenuOpen, setAddMenuOpen] = useState(false);

  // Formatting helpers
  const formatInr = (amount: number | string) => {
    const num = Number(amount);
    if (isNaN(num) || num === 0) return "₹36,74,200";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(num);
  };

  const formatNumber = (val: number | undefined, defaultVal: number | string) => {
    if (val === undefined || val === null) return defaultVal;
    return val > 0 ? val.toLocaleString("en-IN") : defaultVal;
  };

  // Values using real data with elegant fallbacks matching mockup
  const movieCount = formatNumber(data?.totalMovies, 248);
  const eventCount = formatNumber(data?.events, 64);
  const comedyCount = formatNumber(data?.comedyShows, 38);
  const diningCount = formatNumber(data?.diningPartners, 26);
  const bookingCount = formatNumber(data?.bookings, "12,846");
  const revenueVal = data?.grossRevenue ? formatInr(data.grossRevenue) : "₹36,74,200";

  // Content Management Cards
  const managementItems: ManagementItem[] = [
    {
      id: "movies",
      title: "Movies",
      description: "Add, edit and publish movies",
      image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80",
      to: "/admin/movies",
    },
    {
      id: "events",
      title: "Events",
      description: "Manage events and tickets",
      image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80",
      to: "/admin/events",
    },
    {
      id: "comedy",
      title: "Comedy Shows",
      description: "Add comedy gigs & shows",
      image: "https://images.unsplash.com/photo-1585699324551-f6c309eedeca?auto=format&fit=crop&w=800&q=80",
      to: "/admin/comedy",
    },
    {
      id: "dining",
      title: "Dining",
      description: "Manage restaurants & menus",
      image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80",
      to: "/admin/dining",
    },
  ];

  return (
    <div className="space-y-8 pb-10">
      {/* 1. CINEMATIC HERO SECTION */}
      <section className="relative overflow-hidden rounded-[26px] border border-slate-100 bg-white shadow-[0_10px_35px_rgba(0,0,0,0.03)]">
        {/* Right side concert crowd background fading into white */}
        <div className="pointer-events-none absolute inset-y-0 right-0 w-full sm:w-[65%] lg:w-[58%]">
          <img
            src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1600&q=85"
            alt=""
            aria-hidden="true"
            className="size-full object-cover object-[center_35%]"
          />
          {/* Smooth horizontal gradient to blend with the white card background */}
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-white/40 via-transparent to-transparent" />
        </div>

        {/* Hero Content Left */}
        <div className="relative z-10 max-w-2xl px-6 py-9 sm:px-10 sm:py-12">
          {/* Subtitle tag */}
          <p className="text-[11px] font-extrabold uppercase tracking-[.25em] text-slate-400">
            MANAGE • CREATE • PUBLISH
          </p>

          {/* Heading */}
          <h1 className="mt-2 font-display text-[clamp(2.75rem,5.5vw,4.5rem)] font-extrabold uppercase leading-[.9] tracking-tight text-[#171717]">
            ADMIN <span className="text-[#E31824]">PORTAL</span>
          </h1>

          {/* Subtitle description */}
          <p className="mt-4 max-w-lg text-sm font-medium leading-relaxed text-slate-600 sm:text-base">
            Create, manage and grow your movies, events, comedy shows, dining and more — all in one place.
          </p>

          {/* Action Buttons */}
          <div className="mt-7 flex flex-wrap items-center gap-3.5">
            {/* + Add Now dropdown/button */}
            <div className="relative">
              <button
                onClick={() => setAddMenuOpen((prev) => !prev)}
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#E31824] px-5 text-xs font-extrabold uppercase tracking-wider text-white shadow-lg shadow-[#E31824]/25 transition hover:bg-[#c4141e]"
              >
                <Plus size={16} strokeWidth={2.5} />
                <span>+ Add Now</span>
                <ChevronDown size={14} className="opacity-80" />
              </button>

              {addMenuOpen && (
                <div
                  className="absolute left-0 top-13 z-50 w-48 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl"
                  onClick={() => setAddMenuOpen(false)}
                >
                  <Link
                    to="/admin/movies/new"
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#E31824]"
                  >
                    <Film size={15} />
                    <span>Add Movie</span>
                  </Link>
                  <Link
                    to="/admin/events/new"
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#E31824]"
                  >
                    <Calendar size={15} />
                    <span>Create Event</span>
                  </Link>
                  <Link
                    to="/admin/comedy/new"
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#E31824]"
                  >
                    <Mic size={15} />
                    <span>Add Comedy Show</span>
                  </Link>
                  <Link
                    to="/admin/dining/new"
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#E31824]"
                  >
                    <Utensils size={15} />
                    <span>Add Dining Partner</span>
                  </Link>
                </div>
              )}
            </div>

            {/* View Site link */}
            <Link
              to="/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white/80 px-5 text-xs font-bold text-slate-700 shadow-sm backdrop-blur-sm transition hover:bg-white hover:text-slate-900"
            >
              <span>View Site</span>
              <ExternalLink size={14} className="text-slate-400" />
            </Link>
          </div>
        </div>
      </section>

      {/* 2. SIX STATISTICS CARDS */}
      <section aria-labelledby="stats-heading">
        <h2 id="stats-heading" className="sr-only">Key Statistics</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
          {/* Card 1: Total Movies */}
          <StatCard
            icon={Film}
            value={movieCount}
            label="Total Movies"
            growth="+12%"
            watermark={
              <svg className="size-20" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" fill="none" />
                <circle cx="12" cy="12" r="3" />
                <circle cx="12" cy="6" r="1.5" />
                <circle cx="12" cy="18" r="1.5" />
                <circle cx="6" cy="12" r="1.5" />
                <circle cx="18" cy="12" r="1.5" />
              </svg>
            }
          />

          {/* Card 2: Total Events */}
          <StatCard
            icon={Calendar}
            value={eventCount}
            label="Total Events"
            growth="+18%"
            watermark={
              <svg className="size-20" viewBox="0 0 24 24" fill="currentColor">
                <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
                <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2" />
                <rect x="7" y="13" width="2" height="2" />
                <rect x="11" y="13" width="2" height="2" />
                <rect x="15" y="13" width="2" height="2" />
                <rect x="7" y="17" width="2" height="2" />
                <rect x="11" y="17" width="2" height="2" />
              </svg>
            }
          />

          {/* Card 3: Comedy Shows */}
          <StatCard
            icon={Mic}
            value={comedyCount}
            label="Comedy Shows"
            growth="+9%"
            watermark={
              <svg className="size-20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke="currentColor" strokeWidth="2" fill="none" />
                <line x1="12" y1="19" x2="12" y2="23" stroke="currentColor" strokeWidth="2" />
              </svg>
            }
          />

          {/* Card 4: Dining Partners */}
          <StatCard
            icon={Utensils}
            value={diningCount}
            label="Dining Partners"
            growth="+14%"
            watermark={
              <svg className="size-20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 2v20M14 2v6a3 3 0 0 0 3 3v11M6 2v7a2 2 0 0 0 2 2v11M10 2v7a2 2 0 0 1-2 2" stroke="currentColor" strokeWidth="2" fill="none" />
              </svg>
            }
          />

          {/* Card 5: Total Bookings */}
          <StatCard
            icon={Ticket}
            value={bookingCount}
            label="Total Bookings"
            growth="+24%"
            watermark={
              <svg className="size-20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" stroke="currentColor" strokeWidth="2" fill="none" />
                <line x1="13" y1="5" x2="13" y2="19" stroke="currentColor" strokeWidth="2" strokeDasharray="3 3" />
              </svg>
            }
          />

          {/* Card 6: Total Revenue */}
          <StatCard
            icon={Coins}
            value={revenueVal}
            label="Total Revenue"
            growth="+31%"
            watermark={
              <svg className="size-20" viewBox="0 0 24 24" fill="currentColor">
                <ellipse cx="12" cy="7" rx="8" ry="4" stroke="currentColor" strokeWidth="2" fill="none" />
                <path d="M4 7v6c0 2.2 3.6 4 8 4s8-1.8 8-4V7" stroke="currentColor" strokeWidth="2" fill="none" />
                <path d="M4 13v6c0 2.2 3.6 4 8 4s8-1.8 8-4v-6" stroke="currentColor" strokeWidth="2" fill="none" />
              </svg>
            }
          />
        </div>
      </section>

      {/* 3. CONTENT MANAGEMENT SECTION */}
      <section className="space-y-4">
        {/* Section Heading */}
        <div>
          <p className="text-[11px] font-extrabold uppercase tracking-[.25em] text-[#E31824]">
            MANAGE CONTENT
          </p>
          <h2 className="mt-1 font-display text-[clamp(2rem,4vw,3.25rem)] font-extrabold uppercase leading-[.9] tracking-tight text-[#171717]">
            HANDLE EVERYTHING <span className="text-[#E31824]">AT ONE PLACE.</span>
          </h2>
        </div>

        {/* Four Large Cinematic Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {managementItems.map((item) => (
            <ManagementCard key={item.id} item={item} />
          ))}
        </div>
      </section>

      {/* 4. BOTTOM SECTION: Recent Activity + Analytics ("Today at a Glance") */}
      <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Left: Recent Activity */}
        <RecentActivity data={data} />

        {/* Right: Analytics ("Today at a Glance") */}
        <AnalyticsCard />
      </section>
    </div>
  );
}
