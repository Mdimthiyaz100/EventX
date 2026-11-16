import { ArrowUpRight } from "lucide-react";
import type { EventCategory } from "../../types/event";

export interface CategoryItem {
  name: EventCategory;
  subtitle: string;
  imageUrl: string;
}

interface CategoryCardProps {
  category: CategoryItem;
  onSelect: (category: EventCategory) => void;
}

export default function CategoryCard({
  category,
  onSelect,
}: CategoryCardProps) {
  return (
    <button
      aria-label={`Explore ${category.name} events`}
      className="category-card group relative min-h-40 overflow-hidden rounded-xl bg-ink text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-eventx-dark sm:min-h-44"
      onClick={() => onSelect(category.name)}
      type="button"
    >
      <img
        alt=""
        aria-hidden="true"
        className="absolute inset-0 size-full object-cover opacity-75 transition duration-700 group-hover:scale-105 group-hover:opacity-90"
        loading="lazy"
        src={category.imageUrl}
      />
      <span className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-black/5" />
      <span className="absolute inset-x-0 bottom-0 flex items-end justify-between p-4 text-white">
        <span>
          <span className="block font-display text-2xl font-bold uppercase leading-none">
            {category.name}
          </span>
          <span className="mt-1 block text-xs text-white/80">{category.subtitle}</span>
        </span>
        <span className="grid size-8 place-items-center rounded-full border border-white/50 transition group-hover:border-white group-hover:bg-white group-hover:text-ink">
          <ArrowUpRight aria-hidden="true" size={17} />
        </span>
      </span>
    </button>
  );
}