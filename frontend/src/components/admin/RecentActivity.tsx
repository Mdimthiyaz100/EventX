import { Calendar, Film, Ticket } from "lucide-react";
import type { DashboardStats } from "../../services/adminService";

interface RecentActivityProps {
  data?: DashboardStats;
}

export default function RecentActivity({ data }: RecentActivityProps) {
  // Construct activity list from real data or format nicely
  const activities = [];

  if (data?.latestMovies && data.latestMovies.length > 0) {
    const movie = data.latestMovies[0];
    activities.push({
      id: `movie-${movie.id}`,
      icon: Film,
      title: `New movie added - ${movie.title}`,
      subtitle: `By Admin • ${formatRelativeTime(movie.createdAt || new Date().toISOString())}`,
      badge: "Created",
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
    });
  } else {
    activities.push({
      id: "movie-default",
      icon: Film,
      title: "New movie added - Ramayana",
      subtitle: "By Mohamed Imthiyaz • 10 minutes ago",
      badge: "Created",
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
    });
  }

  if (data?.recentEvents && data.recentEvents.length > 0) {
    const event = data.recentEvents[0];
    activities.push({
      id: `event-${event.id}`,
      icon: Calendar,
      title: `Event updated - ${event.title} | ${event.city}`,
      subtitle: `By Admin • ${formatRelativeTime(event.createdAt || new Date().toISOString())}`,
      badge: "Updated",
      badgeColor: "bg-blue-50 text-blue-700 border-blue-200/60",
    });
  } else {
    activities.push({
      id: "event-default",
      icon: Calendar,
      title: "Event updated - Ota TOKYO 2026 | Delhi",
      subtitle: "By Admin • 28 minutes ago",
      badge: "Updated",
      badgeColor: "bg-blue-50 text-blue-700 border-blue-200/60",
    });
  }

  if (data?.recentBookings && data.recentBookings.length > 0) {
    const booking = data.recentBookings[0];
    activities.push({
      id: `booking-${booking.id}`,
      icon: Ticket,
      title: `Booking #${booking.id.slice(-8).toUpperCase()} confirmed`,
      subtitle: `By ${booking.user?.name || "System"} • ${formatRelativeTime(booking.createdAt)}`,
      badge: "Confirmed",
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
    });
  } else {
    activities.push({
      id: "booking-default",
      icon: Ticket,
      title: "Booking #BK-10846 confirmed",
      subtitle: "By System • 45 minutes ago",
      badge: "Confirmed",
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
    });
  }

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
      <h3 className="text-base font-extrabold text-slate-900">
        Recent Activity
      </h3>

      <div className="mt-5 space-y-4">
        {activities.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className="flex items-center justify-between gap-3 border-b border-slate-50 pb-3.5 last:border-0 last:pb-0"
            >
              <div className="flex items-center gap-3.5">
                <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-red-50 text-[#E31824]">
                  <Icon size={18} />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold text-slate-800">
                    {item.title}
                  </p>
                  <p className="mt-0.5 text-[11px] text-slate-400">
                    {item.subtitle}
                  </p>
                </div>
              </div>

              <span
                className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${item.badgeColor}`}
              >
                {item.badge}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function formatRelativeTime(dateString: string): string {
  try {
    const diffMs = Date.now() - new Date(dateString).getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    if (diffMinutes < 1) return "just now";
    if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} hours ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} days ago`;
  } catch {
    return "recently";
  }
}
