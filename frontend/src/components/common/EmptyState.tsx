import { SearchX } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  onClear?: () => void;
}

export default function EmptyState({
  title,
  description,
  onClear,
}: EmptyStateProps) {
  return (
    <div className="col-span-full flex flex-col items-center rounded-2xl border border-dashed border-ink/20 bg-white/45 px-6 py-14 text-center">
      <span className="mb-4 grid size-12 place-items-center rounded-full bg-eventx/10 text-eventx">
        <SearchX aria-hidden="true" size={22} />
      </span>
      <h3 className="font-display text-2xl font-bold uppercase">{title}</h3>
      <p className="mt-1 max-w-md text-sm leading-6 text-ink/65">{description}</p>
      {onClear && (
        <button
          className="mt-4 text-sm font-bold text-eventx underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eventx"
          onClick={onClear}
          type="button"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
