export function EventCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="overflow-hidden rounded-2xl border border-ink/5 bg-white shadow-sm"
    >
      <div className="skeleton h-52 w-full" />
      <div className="space-y-3 p-4">
        <div className="skeleton h-3 w-16 rounded-full" />
        <div className="skeleton h-5 w-4/5 rounded-full" />
        <div className="skeleton h-3 w-1/2 rounded-full" />
        <div className="skeleton mt-5 h-10 w-full rounded-lg" />
      </div>
    </div>
  );
}