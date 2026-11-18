import { Link } from "react-router-dom";
import { Ticket, Calendar, Heart, ArrowRight } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useWishlist } from "../../context/WishlistContext";

export default function CustomerDashboard() {
  const { user } = useAuth();
  const { wishlist } = useWishlist();

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold uppercase tracking-tight text-white">
          Hello, {user?.name || "Customer"}
        </h1>
        <p className="mt-1 text-sm text-white/50">
          Manage your tickets, saved events, and profile settings.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        <Link
          to="/my-bookings"
          className="group rounded-2xl border border-white/10 bg-[#121216] p-6 transition hover:border-[#E31824]/40"
        >
          <div className="flex size-12 items-center justify-center rounded-xl bg-[#E31824]/10 text-[#E31824]">
            <Ticket size={24} />
          </div>
          <h3 className="mt-4 text-lg font-bold text-white group-hover:text-[#E31824] transition">
            My Bookings
          </h3>
          <p className="mt-1 text-xs text-white/50">
            View booking status, invoice totals, and payment status.
          </p>
          <div className="mt-4 flex items-center gap-1 text-xs font-bold text-white/60 group-hover:text-white">
            <span>Manage Bookings</span>
            <ArrowRight size={13} />
          </div>
        </Link>

        <Link
          to="/my-tickets"
          className="group rounded-2xl border border-white/10 bg-[#121216] p-6 transition hover:border-[#E31824]/40"
        >
          <div className="flex size-12 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
            <Calendar size={24} />
          </div>
          <h3 className="mt-4 text-lg font-bold text-white group-hover:text-purple-400 transition">
            Digital Tickets
          </h3>
          <p className="mt-1 text-xs text-white/50">
            Display QR verification passes at venue entrance gates.
          </p>
          <div className="mt-4 flex items-center gap-1 text-xs font-bold text-white/60 group-hover:text-white">
            <span>View Passes</span>
            <ArrowRight size={13} />
          </div>
        </Link>

        <Link
          to="/favorites"
          className="group rounded-2xl border border-white/10 bg-[#121216] p-6 transition hover:border-[#E31824]/40"
        >
          <div className="flex size-12 items-center justify-center rounded-xl bg-pink-500/10 text-pink-400">
            <Heart size={24} />
          </div>
          <h3 className="mt-4 text-lg font-bold text-white group-hover:text-pink-400 transition">
            Favourites ({wishlist.length})
          </h3>
          <p className="mt-1 text-xs text-white/50">
            Quickly access your bookmarked movies and live shows.
          </p>
          <div className="mt-4 flex items-center gap-1 text-xs font-bold text-white/60 group-hover:text-white">
            <span>View Wishlist</span>
            <ArrowRight size={13} />
          </div>
        </Link>
      </div>
    </div>
  );
}
