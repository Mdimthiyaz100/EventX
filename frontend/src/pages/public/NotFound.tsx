import { Link } from "react-router-dom";
import { ArrowLeft, Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-16 text-center text-white">
      <div className="mb-6 flex size-20 items-center justify-center rounded-2xl border border-white/10 bg-[#16141F]/80 shadow-2xl shadow-[#E31824]/10 backdrop-blur-md">
        <Compass className="size-10 text-[#E31824]" />
      </div>

      <span className="mb-2 text-xs font-bold uppercase tracking-widest text-[#E31824]">
        404 — Page Not Found
      </span>

      <h1 className="mb-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
        Lost in the show?
      </h1>

      <p className="mb-8 max-w-md text-sm text-neutral-400">
        The page you are looking for doesn&apos;t exist, was moved, or requires higher access credentials.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-xl bg-[#E31824] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#E31824]/20 transition-all hover:bg-[#c9141f]"
        >
          <ArrowLeft className="size-4" />
          Back to Home
        </Link>
        <Link
          to="/events"
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-white/10"
        >
          Explore Events
        </Link>
      </div>
    </div>
  );
}
