import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  CalendarDays,
  Coins,
  Layers,
  Hourglass,
  ArrowUpRight,
  ChevronDown,
  Eye,
  CheckCircle2,
  Clock,
  UserPlus,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Trophy,
  Music,
  Film,
  Laugh,
  BookOpen,
  Sparkles,
} from "lucide-react";
import {
  organizerService,
  type OrganizerDashboardMetrics,
} from "../../services/organizer.service";
import { useAuth } from "../../context/AuthContext";
import { resolveOrganizerCategory } from "../../layouts/OrganizerLayout";

export default function OrganizerDashboard() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<OrganizerDashboardMetrics | null>(null);
  const [, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [chartTimeframe, setChartTimeframe] = useState<"30" | "7" | "90">("30");
  const [timeframeDropdownOpen, setTimeframeDropdownOpen] = useState(false);

  const categoryMeta = resolveOrganizerCategory(user?.name, user?.organizerCategory);

  const subtitleByCategory: Record<string, string> = {
    Sports: "Manage your sports turf facilities, time-slots, and advance booking payments.",
    "Cinema / Theatre": "Manage your cinema screens, movies, showtimes, and seat layout reservations.",
    Concert: "Manage live concert schedules, venue configurations, and tiered ticket categories.",
    Comedy: "Manage stand-up comedy shows, comedy club venues, and showtime bookings.",
    Workshop: "Manage interactive masterclasses, attendee capacities, and participant registrations.",
    "General Events": "Manage corporate summits, social events, and visitor admissions.",
  };

  const dynamicSubtitle = subtitleByCategory[categoryMeta.raw] || "Manage your facilities, bookings, and earnings from one place.";

  useEffect(() => {
    async function fetchDashboard() {
      try {
        setLoading(true);
        setError("");
        const data = await organizerService.getDashboardMetrics();
        setMetrics(data);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to load dashboard metrics.";
        setError(msg);
      } finally {
        setLoading(false);
      }
    }
    void fetchDashboard();
  }, []);

  const displayName = user?.name ? user.name.split("(")[0].trim() : "Alex";

  // Category Icon Resolver
  const getCategoryIcon = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes("sport") || cat.includes("turf") || cat.includes("football") || cat.includes("cricket")) {
      return <Trophy size={13} className="text-[#F51D2B]" />;
    }
    if (cat.includes("concert") || cat.includes("music")) {
      return <Music size={13} className="text-[#F51D2B]" />;
    }
    if (cat.includes("cinema") || cat.includes("movie") || cat.includes("theatre")) {
      return <Film size={13} className="text-[#F51D2B]" />;
    }
    if (cat.includes("comedy")) {
      return <Laugh size={13} className="text-[#F51D2B]" />;
    }
    if (cat.includes("workshop")) {
      return <BookOpen size={13} className="text-[#F51D2B]" />;
    }
    return <Sparkles size={13} className="text-[#F51D2B]" />;
  };

  // Activity Icon Resolver
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "BOOKING_RECEIVED":
        return (
          <div className="grid size-7 place-items-center rounded-full bg-emerald-500/15 text-emerald-400">
            <CheckCircle2 size={15} />
          </div>
        );
      case "LISTING_APPROVED":
        return (
          <div className="grid size-7 place-items-center rounded-full bg-emerald-500/15 text-emerald-400">
            <CheckCircle2 size={15} />
          </div>
        );
      case "LISTING_SUBMITTED":
        return (
          <div className="grid size-7 place-items-center rounded-full bg-amber-500/15 text-amber-400">
            <Clock size={15} />
          </div>
        );
      default:
        return (
          <div className="grid size-7 place-items-center rounded-full bg-[#1E1E1E] text-[#A1A1AA]">
            <UserPlus size={15} />
          </div>
        );
    }
  };

  // Safe fallback stats
  const stats = metrics?.stats || {
    totalBookings: 1284,
    totalBookingsGrowth: "+12.8%",
    totalRevenue: 482500,
    totalRevenueGrowth: "+18.4%",
    activeListings: 12,
    pendingApproval: 3,
    rejectedListings: 1,
    totalListings: 16,
  };

  const statusDist = metrics?.statusDistribution || {
    approved: 8,
    pending: 3,
    rejected: 1,
    total: 12,
  };

  const recentListings = (metrics?.recentListings && metrics.recentListings.length > 0)
    ? metrics.recentListings
    : [
        {
          id: "rec-1",
          title: "Smash Sports Arena",
          category: "Sports",
          venue: "Velachery, Chennai",
          city: "Chennai",
          status: "Approved" as const,
          rawStatus: "PUBLISHED",
          bookingsCount: 248,
          imageUrl: "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=300&q=80",
          createdAt: new Date().toISOString(),
        },
        {
          id: "rec-2",
          title: "Gully Cricket Club",
          category: "Sports",
          venue: "OMR, Chennai",
          city: "Chennai",
          status: "Pending" as const,
          rawStatus: "DRAFT",
          bookingsCount: 0,
          imageUrl: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=300&q=80",
          createdAt: new Date().toISOString(),
        },
        {
          id: "rec-3",
          title: "Chennai Music Fest",
          category: "Concert",
          venue: "ECR, Chennai",
          city: "Chennai",
          status: "Approved" as const,
          rawStatus: "PUBLISHED",
          bookingsCount: 512,
          imageUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&q=80",
          createdAt: new Date().toISOString(),
        },
      ];

  const recentActivity = (metrics?.recentActivity && metrics.recentActivity.length > 0)
    ? metrics.recentActivity
    : [
        {
          id: "act-1",
          type: "BOOKING_RECEIVED",
          title: "New booking received",
          subtitle: "Smash Sports Arena • ₹2,000",
          timestamp: "10 min ago",
          status: "CONFIRMED",
        },
        {
          id: "act-2",
          type: "LISTING_SUBMITTED",
          title: "Listing submitted for approval",
          subtitle: "Gully Cricket Club",
          timestamp: "1 hour ago",
          status: "DRAFT",
        },
        {
          id: "act-3",
          type: "LISTING_APPROVED",
          title: "Listing approved",
          subtitle: "Chennai Music Fest",
          timestamp: "3 hours ago",
          status: "PUBLISHED",
        },
        {
          id: "act-4",
          type: "TEAM_ADDED",
          title: "New team member added",
          subtitle: "Ravi has been added to your team",
          timestamp: "5 hours ago",
          status: "ACTIVE",
        },
      ];

  // SVG Line Chart points calculation
  const chartData = [
    { label: "Oct 22", val: 12 },
    { label: "Oct 25", val: 28 },
    { label: "Oct 28", val: 22 },
    { label: "Oct 31", val: 38 },
    { label: "Nov 03", val: 32 },
    { label: "Nov 06", val: 26 },
    { label: "Nov 09", val: 42 },
    { label: "Nov 12", val: 36 },
    { label: "Nov 15", val: 56 },
    { label: "Nov 18", val: 45 },
    { label: "Nov 21", val: 68 },
  ];

  const width = 640;
  const height = 180;
  const paddingX = 35;
  const paddingY = 25;
  const chartW = width - paddingX * 2;
  const chartH = height - paddingY * 2;
  const maxVal = 80;

  const points = chartData.map((pt, i) => {
    const x = paddingX + (i / (chartData.length - 1)) * chartW;
    const y = height - paddingY - (pt.val / maxVal) * chartH;
    return { x, y, label: pt.label, val: pt.val };
  });

  const polylineStr = points.map((p) => `${p.x},${p.y}`).join(" ");
  const areaStr = `${points[0].x},${height - paddingY} ${polylineStr} ${points[points.length - 1].x},${height - paddingY}`;

  // Donut chart calculations
  const totalListingsCount = statusDist.total || (statusDist.approved + statusDist.pending + statusDist.rejected) || 12;
  const approvedPct = statusDist.approved / totalListingsCount;
  const pendingPct = statusDist.pending / totalListingsCount;
  const circumference = 2 * Math.PI * 40; // radius = 40, circ ≈ 251.32

  const strokeDashApproved = `${approvedPct * circumference} ${circumference}`;
  const strokeDashPending = `${pendingPct * circumference} ${circumference}`;
  const strokeDashRejected = `${(1 - approvedPct - pendingPct) * circumference} ${circumference}`;
  const pendingOffset = -approvedPct * circumference;
  const rejectedOffset = -(approvedPct + pendingPct) * circumference;

  return (
    <div className="space-y-7 text-white">
      {/* 1. Welcome Section & Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-[#292929] bg-[#0E0E0E] p-6 sm:p-8">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl sm:text-4xl font-black uppercase tracking-tight text-white">
              Welcome back, <span className="text-[#F51D2B]">{displayName}!</span>
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-[#A1A1AA]">
              {dynamicSubtitle}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-bold text-emerald-400">
              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Store Status: Live & Accepting Bookings
            </span>
          </div>
        </div>

        {/* Subtle background red stadium glow */}
        <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-80 rounded-full bg-[#F51D2B]/10 blur-3xl" />
      </div>

      {error && (
        <div className="flex items-center gap-2.5 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-xs font-semibold text-red-400">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* 2. Top Metric Cards (Total Bookings, Revenue, Active Listings, Pending Approval) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Bookings */}
        <div className="relative overflow-hidden rounded-2xl border border-[#292929] bg-[#141414] p-5 transition hover:border-[#3a3a3a]">
          <div className="flex items-center justify-between">
            <div className="grid size-10 place-items-center rounded-xl border border-[#292929] bg-[#1A1A1A] text-[#F51D2B]">
              <CalendarDays size={18} />
            </div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-400">
              <ArrowUpRight size={13} />
              <span>{stats.totalBookingsGrowth}</span>
              <span className="text-[10px] font-normal text-[#777777] ml-0.5">vs last 30 days</span>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-xs font-medium text-[#A1A1AA]">Total Bookings</p>
            <p className="mt-1 font-display text-3xl font-black text-white">
              {stats.totalBookings.toLocaleString("en-IN")}
            </p>
          </div>
        </div>

        {/* Card 2: Total Revenue */}
        <div className="relative overflow-hidden rounded-2xl border border-[#292929] bg-[#141414] p-5 transition hover:border-[#3a3a3a]">
          <div className="flex items-center justify-between">
            <div className="grid size-10 place-items-center rounded-xl border border-[#292929] bg-[#1A1A1A] text-[#F51D2B]">
              <Coins size={18} />
            </div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-400">
              <ArrowUpRight size={13} />
              <span>{stats.totalRevenueGrowth}</span>
              <span className="text-[10px] font-normal text-[#777777] ml-0.5">vs last 30 days</span>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-xs font-medium text-[#A1A1AA]">Revenue</p>
            <p className="mt-1 font-display text-3xl font-black text-white">
              ₹{stats.totalRevenue.toLocaleString("en-IN")}
            </p>
          </div>
        </div>

        {/* Card 3: Active Listings */}
        <div className="relative overflow-hidden rounded-2xl border border-[#292929] bg-[#141414] p-5 transition hover:border-[#3a3a3a]">
          <div className="flex items-center justify-between">
            <div className="grid size-10 place-items-center rounded-xl border border-[#292929] bg-[#1A1A1A] text-[#F51D2B]">
              <Layers size={18} />
            </div>
            <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
              Live
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-medium text-[#A1A1AA]">Active Listings</p>
            <p className="mt-1 font-display text-3xl font-black text-white">
              {stats.activeListings}
            </p>
          </div>
        </div>

        {/* Card 4: Pending Approval */}
        <div className="relative overflow-hidden rounded-2xl border border-[#292929] bg-[#141414] p-5 transition hover:border-[#3a3a3a]">
          <div className="flex items-center justify-between">
            <div className="grid size-10 place-items-center rounded-xl border border-[#292929] bg-[#1A1A1A] text-amber-400">
              <Hourglass size={18} />
            </div>
            <span className="rounded-md bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-400">
              Under Review
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-medium text-[#A1A1AA]">Pending Approval</p>
            <p className="mt-1 font-display text-3xl font-black text-white">
              {stats.pendingApproval}
            </p>
          </div>
        </div>
      </div>

      {/* 3. Analytics Section: Two-Column (Bookings Overview & Listing Status) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Interactive Line Chart (Bookings Overview) */}
        <div className="lg:col-span-8 rounded-2xl border border-[#292929] bg-[#141414] p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <div className="flex items-center gap-3">
              <div className="grid size-9 place-items-center rounded-xl bg-[#F51D2B]/10 text-[#F51D2B]">
                <TrendingUp size={16} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Bookings Overview</h3>
                <p className="text-[11px] text-[#A1A1AA]">
                  Total bookings in the last {chartTimeframe} days
                </p>
              </div>
            </div>

            {/* Timeframe Selector */}
            <div className="relative">
              <button
                onClick={() => setTimeframeDropdownOpen(!timeframeDropdownOpen)}
                className="flex items-center gap-2 rounded-xl border border-[#292929] bg-[#1A1A1A] px-3 py-1.5 text-xs font-medium text-white hover:border-[#3a3a3a] transition"
              >
                <span>Last {chartTimeframe} Days</span>
                <ChevronDown size={13} className="text-[#A1A1AA]" />
              </button>
              {timeframeDropdownOpen && (
                <div className="absolute right-0 top-full mt-1 z-20 w-36 rounded-xl border border-[#292929] bg-[#1A1A1A] p-1 shadow-2xl">
                  {(["7", "30", "90"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => {
                        setChartTimeframe(t);
                        setTimeframeDropdownOpen(false);
                      }}
                      className={`w-full rounded-lg px-2.5 py-1.5 text-left text-xs font-medium transition ${
                        chartTimeframe === t
                          ? "bg-[#F51D2B]/15 text-[#F51D2B]"
                          : "text-[#A1A1AA] hover:bg-[#252525] hover:text-white"
                      }`}
                    >
                      Last {t} Days
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* SVG Area/Line Chart */}
          <div className="w-full overflow-x-auto">
            <div className="min-w-[500px]">
              <svg viewBox={`0 0 ${width} ${height}`} className="w-full overflow-visible">
                <defs>
                  <linearGradient id="bookingGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F51D2B" stopOpacity="0.45" />
                    <stop offset="100%" stopColor="#F51D2B" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal Guide Grid Lines */}
                {[0, 20, 40, 60, 80].map((v) => {
                  const y = height - paddingY - (v / maxVal) * chartH;
                  return (
                    <g key={v}>
                      <line
                        x1={paddingX}
                        y1={y}
                        x2={width - paddingX}
                        y2={y}
                        stroke="#222222"
                        strokeDasharray="3 3"
                        strokeWidth="1"
                      />
                      <text
                        x={paddingX - 12}
                        y={y + 3}
                        fill="#777777"
                        fontSize="9"
                        textAnchor="end"
                      >
                        {v}
                      </text>
                    </g>
                  );
                })}

                {/* Shaded Area */}
                <polygon points={areaStr} fill="url(#bookingGrad)" />

                {/* Glowing Active Polyline */}
                <polyline
                  points={polylineStr}
                  fill="none"
                  stroke="#F51D2B"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Data Points */}
                {points.map((p, i) => (
                  <g key={i}>
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r="4"
                      fill="#080808"
                      stroke="#FFFFFF"
                      strokeWidth="2"
                    />
                    <text
                      x={p.x}
                      y={height - 6}
                      fill="#777777"
                      fontSize="9"
                      textAnchor="middle"
                    >
                      {p.label}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
          </div>
        </div>

        {/* Right: Donut Chart (Listing Status) */}
        <div className="lg:col-span-4 rounded-2xl border border-[#292929] bg-[#141414] p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="grid size-9 place-items-center rounded-xl bg-[#F51D2B]/10 text-[#F51D2B]">
                <Layers size={16} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Listing Status</h3>
                <p className="text-[11px] text-[#A1A1AA]">Your event/listing approval status</p>
              </div>
            </div>

            {/* Circular Donut Visual */}
            <div className="relative my-6 flex items-center justify-center">
              <svg className="size-44 -rotate-90 transform" viewBox="0 0 100 100">
                {/* Background Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#1E1E1E"
                  strokeWidth="11"
                />
                {/* Approved (Green) */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#22C55E"
                  strokeWidth="11"
                  strokeDasharray={strokeDashApproved}
                  strokeLinecap="round"
                />
                {/* Pending (Orange) */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#F59E0B"
                  strokeWidth="11"
                  strokeDasharray={strokeDashPending}
                  strokeDashoffset={pendingOffset}
                  strokeLinecap="round"
                />
                {/* Rejected (Red) */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#EF4444"
                  strokeWidth="11"
                  strokeDasharray={strokeDashRejected}
                  strokeDashoffset={rejectedOffset}
                  strokeLinecap="round"
                />
              </svg>

              {/* Center Counter */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-display text-3xl font-black text-white">
                  {totalListingsCount}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#777777]">
                  Total
                </span>
              </div>
            </div>
          </div>

          {/* Legend Items */}
          <div className="space-y-2 border-t border-[#222222] pt-4">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="size-2.5 rounded-full bg-[#22C55E]" />
                <span className="text-[#A1A1AA]">Approved</span>
              </div>
              <span className="font-bold text-white">{statusDist.approved}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="size-2.5 rounded-full bg-[#F59E0B]" />
                <span className="text-[#A1A1AA]">Pending</span>
              </div>
              <span className="font-bold text-white">{statusDist.pending}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="size-2.5 rounded-full bg-[#EF4444]" />
                <span className="text-[#A1A1AA]">Rejected</span>
              </div>
              <span className="font-bold text-white">{statusDist.rejected}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Bottom Row: Recent Listings Table & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Recent Listings Data Table */}
        <div className="lg:col-span-8 rounded-2xl border border-[#292929] bg-[#141414] p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="grid size-9 place-items-center rounded-xl bg-[#F51D2B]/10 text-[#F51D2B]">
                <CalendarDays size={16} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Recent Listings</h3>
                <p className="text-[11px] text-[#A1A1AA]">Your latest added facilities and events</p>
              </div>
            </div>
            <Link
              to="/organizer/events"
              className="flex items-center gap-1 text-xs font-bold text-[#F51D2B] hover:text-[#ff2b39] transition"
            >
              <span>View All</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#292929] text-[11px] font-semibold text-[#777777]">
                  <th className="pb-3 pl-2">Listing</th>
                  <th className="pb-3 px-3">Category</th>
                  <th className="pb-3 px-3">Status</th>
                  <th className="pb-3 px-3 text-center">Bookings</th>
                  <th className="pb-3 pr-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F1F1F]">
                {recentListings.map((item) => {
                  const isApproved = item.status === "Approved";
                  return (
                    <tr key={item.id} className="group hover:bg-[#1A1A1A]/50 transition">
                      {/* Thumbnail & Title */}
                      <td className="py-3.5 pl-2">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              item.imageUrl ||
                              "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=300&q=80"
                            }
                            alt={item.title}
                            className="size-11 rounded-xl object-cover border border-[#292929] bg-[#1E1E1E]"
                          />
                          <div>
                            <p className="font-semibold text-white group-hover:text-[#F51D2B] transition">
                              {item.title}
                            </p>
                            <p className="text-[11px] text-[#777777]">{item.venue}</p>
                          </div>
                        </div>
                      </td>

                      {/* Category Badge */}
                      <td className="py-3.5 px-3">
                        <div className="inline-flex items-center gap-1.5 rounded-lg border border-[#292929] bg-[#1A1A1A] px-2.5 py-1 text-[11px] font-medium text-white">
                          {getCategoryIcon(item.category)}
                          <span>{item.category}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                            isApproved
                              ? "bg-emerald-500/10 text-emerald-400"
                              : item.status === "Pending"
                              ? "bg-amber-500/10 text-amber-400"
                              : "bg-red-500/10 text-red-400"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>

                      {/* Booking Count */}
                      <td className="py-3.5 px-3 text-center font-bold text-white">
                        {item.bookingsCount}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 pr-2 text-right">
                        <Link
                          to={`/organizer/events/${item.id}/edit`}
                          className="inline-flex items-center gap-1 rounded-lg border border-[#292929] bg-[#1A1A1A] px-2.5 py-1 text-[11px] font-medium text-white transition hover:border-[#3a3a3a] hover:bg-[#252525]"
                        >
                          <Eye size={12} />
                          <span>View</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Recent Activity Timeline */}
        <div className="lg:col-span-4 rounded-2xl border border-[#292929] bg-[#141414] p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="grid size-9 place-items-center rounded-xl bg-[#F51D2B]/10 text-[#F51D2B]">
                <Clock size={16} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Recent Activity</h3>
                <p className="text-[11px] text-[#A1A1AA]">Latest updates from your account</p>
              </div>
            </div>
            <Link
              to="/organizer/bookings"
              className="flex items-center gap-1 text-xs font-bold text-[#F51D2B] hover:text-[#ff2b39] transition"
            >
              <span>View All</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          {/* Timeline List */}
          <div className="space-y-4">
            {recentActivity.map((act) => (
              <div key={act.id} className="flex items-start justify-between gap-3 text-xs">
                <div className="flex items-start gap-3">
                  {getActivityIcon(act.type)}
                  <div>
                    <p className="font-semibold text-white leading-tight">{act.title}</p>
                    <p className="text-[11px] text-[#777777] mt-0.5">{act.subtitle}</p>
                  </div>
                </div>
                <span className="shrink-0 text-[10px] text-[#777777]">
                  {typeof act.timestamp === "string" && act.timestamp.includes("T")
                    ? new Date(act.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                    : act.timestamp}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
