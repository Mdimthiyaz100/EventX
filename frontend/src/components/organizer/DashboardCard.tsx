import { type ReactNode } from "react";

interface DashboardCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
}

export default function DashboardCard({ title, value, subtitle, icon }: DashboardCardProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#121216] p-6">
      <div className="flex items-center justify-between text-white/50">
        <span className="text-xs font-bold uppercase tracking-wider">{title}</span>
        {icon}
      </div>
      <div className="mt-4 text-3xl font-bold text-white">{value}</div>
      {subtitle && <div className="mt-1 text-xs text-white/40">{subtitle}</div>}
    </div>
  );
}
