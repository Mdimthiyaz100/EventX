import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  value: string | number;
  label: string;
  growth: string;
  watermark?: ReactNode;
}

export default function StatCard({
  icon: Icon,
  value,
  label,
  growth,
  watermark,
}: StatCardProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
      {/* Background Watermark Illustration */}
      {watermark && (
        <div className="pointer-events-none absolute -bottom-2 -right-2 opacity-[0.07] text-[#E31824] transition-opacity hover:opacity-10">
          {watermark}
        </div>
      )}

      {/* Top row: Icon in soft red circle + Number */}
      <div className="flex items-center gap-3">
        <div className="grid size-10 place-items-center rounded-xl bg-red-50 text-[#E31824]">
          <Icon size={19} />
        </div>
        <div className="text-2xl font-black tracking-tight text-slate-900 sm:text-[26px]">
          {value}
        </div>
      </div>

      {/* Label */}
      <div className="mt-3 text-xs font-bold text-slate-500">
        {label}
      </div>

      {/* Bottom: Growth Badge */}
      <div className="mt-2 flex items-center gap-1 text-xs font-bold text-emerald-600">
        <span>↑</span>
        <span>{growth}</span>
      </div>
    </div>
  );
}
