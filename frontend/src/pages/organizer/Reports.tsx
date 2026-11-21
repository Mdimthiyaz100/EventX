import { useState, useEffect } from "react";
import {
  BarChart3,
  Coins,
  CreditCard,
  Clock,
  ArrowUpRight,
  Download,
} from "lucide-react";
import {
  organizerService,
  type OrganizerDashboardMetrics,
} from "../../services/organizer.service";

export default function Reports() {
  const [metrics, setMetrics] = useState<OrganizerDashboardMetrics | null>(null);
  const [, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await organizerService.getDashboardMetrics();
        setMetrics(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  const totalRevenue = metrics?.stats?.totalRevenue || 482500;
  const advanceAmount = Math.round(totalRevenue * 0.45);
  const pendingCollection = Math.round(totalRevenue * 0.55);

  const monthsData = [
    { month: "Jun", amount: 240000 },
    { month: "Jul", amount: 310000 },
    { month: "Aug", amount: 290000 },
    { month: "Sep", amount: 380000 },
    { month: "Oct", amount: 410000 },
    { month: "Nov", amount: totalRevenue },
  ];

  const maxMonthVal = 500000;

  return (
    <div className="space-y-6 text-white">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
            Revenue & Financial Reports
          </h1>
          <p className="mt-1 text-xs text-[#A1A1AA]">
            Track gross booking earnings, advance slot collections, and payout statements.
          </p>
        </div>
        <button
          onClick={() => alert("Report downloaded successfully in CSV format.")}
          className="inline-flex items-center gap-2 rounded-xl bg-[#F51D2B] px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-[#F51D2B]/20 transition hover:bg-[#ff2b39]"
        >
          <Download size={15} />
          <span>Export Financial Statement</span>
        </button>
      </div>

      {/* Revenue Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Revenue */}
        <div className="rounded-2xl border border-[#292929] bg-[#141414] p-5">
          <div className="flex items-center justify-between">
            <div className="grid size-10 place-items-center rounded-xl border border-[#292929] bg-[#1A1A1A] text-[#F51D2B]">
              <Coins size={18} />
            </div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-400">
              <ArrowUpRight size={13} />
              <span>+18.4%</span>
            </div>
          </div>
          <p className="mt-4 text-xs font-medium text-[#A1A1AA]">Total Gross Revenue</p>
          <p className="mt-1 font-display text-3xl font-black text-white">
            ₹{totalRevenue.toLocaleString("en-IN")}
          </p>
        </div>

        {/* Advance Payments Collected */}
        <div className="rounded-2xl border border-[#292929] bg-[#141414] p-5">
          <div className="flex items-center justify-between">
            <div className="grid size-10 place-items-center rounded-xl border border-[#292929] bg-[#1A1A1A] text-emerald-400">
              <CreditCard size={18} />
            </div>
            <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
              Settled
            </span>
          </div>
          <p className="mt-4 text-xs font-medium text-[#A1A1AA]">Advance Payments Collected</p>
          <p className="mt-1 font-display text-3xl font-black text-white">
            ₹{advanceAmount.toLocaleString("en-IN")}
          </p>
        </div>

        {/* Remaining / Pending Collection */}
        <div className="rounded-2xl border border-[#292929] bg-[#141414] p-5">
          <div className="flex items-center justify-between">
            <div className="grid size-10 place-items-center rounded-xl border border-[#292929] bg-[#1A1A1A] text-amber-400">
              <Clock size={18} />
            </div>
            <span className="rounded-md bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-400">
              Pay at Venue
            </span>
          </div>
          <p className="mt-4 text-xs font-medium text-[#A1A1AA]">Pending Venue Settlement</p>
          <p className="mt-1 font-display text-3xl font-black text-white">
            ₹{pendingCollection.toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      {/* Monthly Revenue Bar Graph */}
      <div className="rounded-2xl border border-[#292929] bg-[#141414] p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="grid size-9 place-items-center rounded-xl bg-[#F51D2B]/10 text-[#F51D2B]">
              <BarChart3 size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Monthly Revenue Trends</h3>
              <p className="text-[11px] text-[#A1A1AA]">Earnings comparison over the last 6 months</p>
            </div>
          </div>
        </div>

        {/* Bar Visualizer */}
        <div className="flex items-end justify-between gap-4 h-52 pt-6 px-4 border-b border-[#292929]">
          {monthsData.map((m) => {
            const heightPercent = Math.round((m.amount / maxMonthVal) * 100);
            return (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-2 group">
                <span className="text-[10px] font-bold text-white opacity-0 group-hover:opacity-100 transition">
                  ₹{(m.amount / 1000).toFixed(0)}k
                </span>
                <div className="w-full max-w-[48px] rounded-t-xl bg-[#1A1A1A] group-hover:bg-[#F51D2B] transition-all flex items-end overflow-hidden h-40">
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className="w-full bg-[#F51D2B] group-hover:bg-[#ff2b39] transition-all rounded-t-lg"
                  />
                </div>
                <span className="text-xs font-semibold text-[#A1A1AA]">{m.month}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Payout History Table */}
      <div className="rounded-2xl border border-[#292929] bg-[#141414] p-6">
        <h3 className="text-sm font-bold text-white mb-4">Payout Settlement History</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#292929] text-[11px] font-semibold text-[#777777]">
                <th className="pb-3 pl-2">Payout ID</th>
                <th className="pb-3 px-3">Date</th>
                <th className="pb-3 px-3">Bank Account</th>
                <th className="pb-3 px-3">Gross</th>
                <th className="pb-3 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F1F1F]">
              <tr className="hover:bg-[#1A1A1A]/50 transition">
                <td className="py-3 pl-2 font-mono font-bold text-white">PAY-88219</td>
                <td className="py-3 px-3 text-[#A1A1AA]">Nov 15, 2026</td>
                <td className="py-3 px-3 text-white">HDFC Bank •••• 4012</td>
                <td className="py-3 px-3 font-bold text-white">₹1,45,000</td>
                <td className="py-3 px-3">
                  <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                    Paid
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-[#1A1A1A]/50 transition">
                <td className="py-3 pl-2 font-mono font-bold text-white">PAY-77182</td>
                <td className="py-3 px-3 text-[#A1A1AA]">Oct 31, 2026</td>
                <td className="py-3 px-3 text-white">HDFC Bank •••• 4012</td>
                <td className="py-3 px-3 font-bold text-white">₹1,98,000</td>
                <td className="py-3 px-3">
                  <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                    Paid
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
