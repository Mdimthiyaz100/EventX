import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export interface ManagementItem {
  id: string;
  title: string;
  description: string;
  image: string;
  to: string;
}

interface ManagementCardProps {
  item: ManagementItem;
}

export default function ManagementCard({ item }: ManagementCardProps) {
  return (
    <Link
      to={item.to}
      className="group relative flex h-48 w-full flex-col justify-end overflow-hidden rounded-2xl p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl sm:h-52"
    >
      {/* Background Image with hover zoom */}
      <img
        src={item.image}
        alt={item.title}
        className="absolute inset-0 size-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
      />

      {/* Dark gradient overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/15 transition-opacity duration-300 group-hover:from-black/95" />

      {/* Card Content & Action Button */}
      <div className="relative z-10 flex items-end justify-between">
        <div>
          <h3 className="font-display text-2xl font-bold uppercase tracking-wide text-white drop-shadow-sm">
            {item.title}
          </h3>
          <p className="mt-1 text-xs font-medium text-white/80">
            {item.description}
          </p>
        </div>

        {/* Circular Arrow Button */}
        <div className="grid size-9 shrink-0 place-items-center rounded-full border border-white/30 bg-white/10 text-white backdrop-blur-md transition-all duration-300 group-hover:border-white group-hover:bg-[#E31824] group-hover:text-white">
          <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-0.5" />
        </div>
      </div>
    </Link>
  );
}
