import { ChevronDown } from "lucide-react";

interface AnalyticsCardProps {
  stats?: {
    bookingsToday?: number;
    weeklyData?: { day: string; value: number }[];
  };
}

const defaultWeeklyData = [
  { day: "Mon", value: 0 },
  { day: "Tue", value: 0 },
  { day: "Wed", value: 0 },
  { day: "Thu", value: 0 },
  { day: "Fri", value: 0 },
  { day: "Sat", value: 0 },
  { day: "Sun", value: 0 },
];

export default function AnalyticsCard({ stats }: AnalyticsCardProps) {
  const timeframe = "Last 7 Days";
  const data = stats?.weeklyData && stats.weeklyData.length === 7 ? stats.weeklyData : defaultWeeklyData;

  const yTicks = [200, 150, 100, 50, 0];
  const peakItem = data[data.length - 1] || { day: "Sun", value: 0 };

  // Chart coordinates mapping (Width 500, Height 150)
  // X from 35 to 485, Y from 135 (value 0) to 15 (value 200)
  const width = 520;
  const height = 150;
  const paddingLeft = 35;
  const paddingRight = 20;
  const chartWidth = width - paddingLeft - paddingRight;

  const points = data.map((d, index) => {
    const x = paddingLeft + (index / (data.length - 1)) * chartWidth;
    const y = height - (d.value / 200) * 125 - 15;
    return { x, y, value: d.value, day: d.day };
  });

  // Generate smooth SVG Catmull-Rom or cubic bezier curve path
  function createCurvePath(pts: { x: number; y: number }[]) {
    if (pts.length === 0) return "";
    let path = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i === 0 ? 0 : i - 1];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2] || p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return path;
  }

  const linePath = createCurvePath(points);
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
      {/* Top: Title + Dropdown */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-extrabold text-slate-900">
          Today at a Glance
        </h3>

        <div className="relative">
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            <span>{timeframe}</span>
            <ChevronDown size={14} className="text-slate-400" />
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="relative mt-6">
        <div className="relative h-[180px] w-full">
          <svg
            viewBox={`0 0 ${width} ${height + 25}`}
            className="size-full overflow-visible"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="curveGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#E31824" stopOpacity="0.28" />
                <stop offset="60%" stopColor="#E31824" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#E31824" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid lines and Y-axis labels */}
            {yTicks.map((tick) => {
              const y = height - (tick / 200) * 125 - 15;
              return (
                <g key={tick}>
                  <line
                    x1={paddingLeft}
                    y1={y}
                    x2={width - paddingRight}
                    y2={y}
                    stroke="#F1F3F5"
                    strokeWidth="1"
                    strokeDasharray={tick === 0 ? "none" : "3 3"}
                  />
                  <text
                    x={paddingLeft - 8}
                    y={y + 4}
                    textAnchor="end"
                    className="text-[10px] font-medium fill-slate-400"
                  >
                    {tick}
                  </text>
                </g>
              );
            })}

            {/* Red Area Fill Under Curve */}
            <path d={areaPath} fill="url(#curveGradient)" />

            {/* Glowing Red Curve Line */}
            <path
              d={linePath}
              fill="none"
              stroke="#E31824"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Peak indicator dot on Sunday */}
            {points.length > 0 && (
              <circle
                cx={points[points.length - 1].x}
                cy={points[points.length - 1].y}
                r="4.5"
                fill="#E31824"
                stroke="#FFFFFF"
                strokeWidth="2"
              />
            )}

            {/* X-axis Day Labels */}
            {points.map((pt) => (
              <text
                key={pt.day}
                x={pt.x}
                y={height + 18}
                textAnchor="middle"
                className="text-[11px] font-semibold fill-slate-500"
              >
                {pt.day}
              </text>
            ))}
          </svg>

          {/* Floating Peak Tag: "182 Bookings" */}
          <div
            className="pointer-events-none absolute -top-1 right-2 sm:right-4 z-10 flex items-center gap-1 rounded-full bg-[#E31824] px-2.5 py-0.5 text-[10px] font-extrabold text-white shadow-md shadow-[#E31824]/30"
          >
            <span>{peakItem.value} Bookings</span>
          </div>
        </div>
      </div>
    </div>
  );
}
