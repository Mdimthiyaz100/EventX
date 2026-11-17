import React from "react";
import UserNavbar from "../components/customer/UserNavbar";
import { Link } from "react-router-dom";
import { Ticket } from "lucide-react";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-[#0A0713] text-white selection:bg-[#E31824] selection:text-white">
      {/* Dynamic User Navigation Bar */}
      <UserNavbar />

      {/* Main Content Viewport */}
      <main className="flex-1" id="main-content">
        {children}
      </main>

      {/* Premium Cinematic Footer */}
      <footer className="mt-20 border-t border-white/10 bg-[#0B0914] text-white">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12 py-16">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-4 lg:grid-cols-5">
            {/* Brand column */}
            <div className="md:col-span-2">
              <Link
                to="/"
                className="font-display text-3xl font-black uppercase tracking-tight text-white"
              >
                Event<span className="text-[#E31824]">X</span>
              </Link>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">
                India's premier live entertainment, concerts, comedy shows, and movie discovery and ticket booking platform.
              </p>
              <div className="mt-6 flex items-center gap-3">
                <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-semibold text-slate-300">
                  <Ticket size={16} className="text-[#E31824]" />
                  <span>100% Genuine Tickets & Instant Entry</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-display text-sm font-bold uppercase tracking-wider text-slate-200">
                Explore
              </h4>
              <ul className="mt-4 space-y-2.5 text-xs font-medium text-slate-400">
                <li><Link to="/events" className="hover:text-white transition">All Events</Link></li>
                <li><Link to="/movies" className="hover:text-white transition">Latest Movies</Link></li>
                <li><Link to="/category/Comedy Shows" className="hover:text-white transition">Comedy Shows</Link></li>
                <li><Link to="/category/Concerts" className="hover:text-white transition">Live Concerts</Link></li>
                <li><Link to="/category/Theatre" className="hover:text-white transition">Plays & Theatre</Link></li>
                <li><Link to="/category/Sports" className="hover:text-white transition">Sports Matches</Link></li>
              </ul>
            </div>

            {/* Portals */}
            <div>
              <h4 className="font-display text-sm font-bold uppercase tracking-wider text-slate-200">
                Portals & Auth
              </h4>
              <ul className="mt-4 space-y-2.5 text-xs font-medium text-slate-400">
                <li><Link to="/login" className="hover:text-white transition">User Login</Link></li>
                <li><Link to="/choose-portal" className="hover:text-white transition">Portal Selector</Link></li>
                <li><Link to="/my-bookings" className="hover:text-white transition">My Bookings</Link></li>
                <li><Link to="/wishlist" className="hover:text-white transition">My Wishlist</Link></li>
                <li><Link to="/admin/login" className="hover:text-[#E31824] transition">Admin Portal Login</Link></li>
              </ul>
            </div>

            {/* Help & Contact */}
            <div>
              <h4 className="font-display text-sm font-bold uppercase tracking-wider text-slate-200">
                EventX Support
              </h4>
              <ul className="mt-4 space-y-2.5 text-xs font-medium text-slate-400">
                <li><span>support@eventx.com</span></li>
                <li><span>Toll Free: 1800-EVENT-X</span></li>
                <li><span>Terms of Service</span></li>
                <li><span>Privacy Policy</span></li>
              </ul>
            </div>
          </div>

          <div className="mt-14 border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
            <span>© 2026 EventX Entertainment Network. All rights reserved.</span>
            <div className="flex items-center gap-6">
              <Link to="/choose-portal" className="hover:text-white transition">Switch Portal</Link>
              <Link to="/admin/login" className="hover:text-white transition">Admin Access</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
