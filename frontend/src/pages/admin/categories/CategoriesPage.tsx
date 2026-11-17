import { useQuery } from "@tanstack/react-query";
import { Film, Layers, Tag, Calendar } from "lucide-react";
import { listAdminCategories } from "../../../services/adminService";

export default function CategoriesPage() {
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: listAdminCategories,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-[11px] font-extrabold uppercase tracking-[.25em] text-[#E31824]">
          CONTENT TAXONOMY
        </p>
        <h1 className="mt-1 font-display text-4xl font-extrabold uppercase tracking-tight text-slate-900">
          Categories & Genres
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          Live taxonomy dynamically computed across movies, concerts, comedy, dining and live experiences.
        </p>
      </div>

      {/* Grid of Categories */}
      <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-xl bg-red-50 text-[#E31824]">
            <Layers size={20} />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900">Live Catalog Categories</h2>
            <p className="text-xs text-slate-400">
              Aggregated from active events and movies in the database.
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="h-28 animate-pulse rounded-2xl bg-slate-100" />
            ))}
          </div>
        ) : categories.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat) => (
              <div
                key={cat.name}
                className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-[#FCF9F4] p-5 transition hover:border-slate-200 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-extrabold text-slate-800 group-hover:text-[#E31824]">
                    {cat.name}
                  </h3>
                  <Tag size={16} className="text-slate-400" />
                </div>

                <div className="mt-4 flex gap-2 text-xs font-semibold">
                  <span className="flex items-center gap-1 rounded-lg bg-white px-3 py-1.5 text-slate-700 shadow-xs">
                    <Calendar size={13} className="text-[#E31824]" />
                    {cat.events} Event{cat.events !== 1 ? "s" : ""}
                  </span>
                  <span className="flex items-center gap-1 rounded-lg bg-white px-3 py-1.5 text-slate-700 shadow-xs">
                    <Film size={13} className="text-[#E31824]" />
                    {cat.movies} Movie{cat.movies !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <p className="text-xs text-slate-400">Categories will automatically populate as content is added.</p>
          </div>
        )}
      </section>
    </div>
  );
}
