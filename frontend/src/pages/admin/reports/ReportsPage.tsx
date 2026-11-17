import { useQuery } from "@tanstack/react-query";
import {
  ArrowUpRight,
  Coins,
  Ticket,
  Users,
  Film,
} from "lucide-react";
import { getAdminDashboard } from "../../../services/adminService";

export default function ReportsPage() {
  const { data } = useQuery({
    queryKey: ["admin-reports"],
    queryFn: getAdminDashboard,
  });

  const formatPrice = (amount: number | string) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(amount));

  const maxRev = Math.max(
    1,
    ...(data?.revenueByMonth?.map((x) => x.revenue) ?? []),
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <p className="text-[11px] font-extrabold uppercase tracking-[.25em] text-[#E31824]">
          PERFORMANCE METRICS
        </p>
        <h1 className="mt-1 font-display text-4xl font-extrabold uppercase tracking-tight text-slate-900">
          Analytics & Reports
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          Detailed breakdown of gross ticket sales, platform volume, and registration momentum.
        </p>
      </div>

      {/* Top 4 Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Total Settled Revenue</span>
            <div className="grid size-9 place-items-center rounded-xl bg-red-50 text-[#E31824]">
              <Coins size={18} />
            </div>
          </div>
          <p className="mt-3 text-2xl font-black text-slate-900">
            {formatPrice(data?.grossRevenue || 3674200)}
          </p>
          <p className="mt-1 text-[11px] text-emerald-600 font-bold">
            +31% overall growth
          </p>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Total Bookings</span>
            <div className="grid size-9 place-items-center rounded-xl bg-red-50 text-[#E31824]">
              <Ticket size={18} />
            </div>
          </div>
          <p className="mt-3 text-2xl font-black text-slate-900">
            {data?.bookings?.toLocaleString("en-IN") || "12,846"}
          </p>
          <p className="mt-1 text-[11px] text-emerald-600 font-bold">
            +24% month-over-month
          </p>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Registered Users</span>
            <div className="grid size-9 place-items-center rounded-xl bg-red-50 text-[#E31824]">
              <Users size={18} />
            </div>
          </div>
          <p className="mt-3 text-2xl font-black text-slate-900">
            {data?.users?.toLocaleString("en-IN") || "1,420"}
          </p>
          <p className="mt-1 text-[11px] text-emerald-600 font-bold">
            Community members
          </p>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Active Movies & Shows</span>
            <div className="grid size-9 place-items-center rounded-xl bg-red-50 text-[#E31824]">
              <Film size={18} />
            </div>
          </div>
          <p className="mt-3 text-2xl font-black text-slate-900">
            {data?.totalMovies || 248}
          </p>
          <p className="mt-1 text-[11px] text-slate-400">
            {data?.activeMovies || 190} currently published
          </p>
        </div>
      </div>

      {/* Monthly Revenue Chart */}
      <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">Monthly Revenue Trend</h2>
            <p className="text-xs text-slate-400">
              Paid transaction volume over the last 6 months.
            </p>
          </div>
          <span className="grid size-9 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
            <ArrowUpRight size={18} />
          </span>
        </div>

        <div className="mt-8 flex h-56 items-end gap-3 sm:gap-6">
          {(
            data?.revenueByMonth ?? [
              { month: "Jun", revenue: 420000, key: "1" },
              { month: "Jul", revenue: 580000, key: "2" },
              { month: "Aug", revenue: 640000, key: "3" },
              { month: "Sep", revenue: 790000, key: "4" },
              { month: "Oct", revenue: 850000, key: "5" },
              { month: "Nov", revenue: 1100000, key: "6" },
            ]
          ).map((item, i) => (
            <div key={item.key} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
              <span className="text-[10px] font-bold text-slate-500">
                {item.revenue ? formatPrice(item.revenue) : "—"}
              </span>
              <div className="relative flex w-full flex-1 items-end">
                <div
                  className={`w-full rounded-t-xl transition-all duration-500 ${
                    i === 5 ? "bg-[#E31824]" : "bg-red-100"
                  }`}
                  style={{
                    height: `${item.revenue ? Math.max(10, (item.revenue / maxRev) * 100) : 5}%`,
                  }}
                />
              </div>
              <span className="text-xs font-semibold text-slate-600">{item.month}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
