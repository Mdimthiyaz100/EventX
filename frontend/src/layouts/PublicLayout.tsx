import React from "react";
import UserNavbar from "../components/customer/UserNavbar";
import { Link } from "react-router-dom";
import { ShieldCheck, Sparkles, Mail, Phone } from "lucide-react";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-[#000000] text-white selection:bg-[#ED1C24] selection:text-white">
      {/* Sticky Dynamic Navigation Bar matching EventX Black & Red branding */}
      <UserNavbar />

      {/* Main Viewport */}
      <main className="flex-1 bg-[#000000]" id="main-content">
        {children}
      </main>

      {/* Global Black & Red Footer */}
      <footer className="mt-24 border-t border-[#292929] bg-[#0A0A0A] text-white">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12 py-16">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-4 lg:grid-cols-5">
            {/* Brand Column */}
            <div className="md:col-span-2">
              <Link
                to="/"
                className="font-display text-3xl font-black uppercase tracking-tight text-white"
              >
                EVENT<span className="text-[#ED1C24]">X</span>
              </Link>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-[#BDBDBD]">
                India&apos;s premier live entertainment, concerts, movies, comedy shows, dining reservations and sports turf booking platform.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 rounded-xl border border-[#292929] bg-[#111111] px-3.5 py-2 text-xs font-semibold text-[#BDBDBD]">
                  <ShieldCheck size={16} className="text-[#ED1C24]" />
                  <span>100% Verified Tickets & Entry</span>
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-[#292929] bg-[#111111] px-3.5 py-2 text-xs font-semibold text-[#BDBDBD]">
                  <Sparkles size={16} className="text-[#ED1C24]" />
                  <span>Instant Confirmation</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-display text-sm font-bold uppercase tracking-wider text-white">
                Categories
              </h4>
              <ul className="mt-4 space-y-2.5 text-xs font-medium text-[#BDBDBD]">
                <li><Link to="/events" className="hover:text-[#ED1C24] transition">Live Events</Link></li>
                <li><Link to="/movies" className="hover:text-[#ED1C24] transition">Movies & Cinema</Link></li>
                <li><Link to="/comedy" className="hover:text-[#ED1C24] transition">Comedy Shows</Link></li>
                <li><Link to="/concerts" className="hover:text-[#ED1C24] transition">Music Concerts</Link></li>
                <li><Link to="/theatre" className="hover:text-[#ED1C24] transition">Theatre & Drama</Link></li>
                <li><Link to="/sports" className="hover:text-[#ED1C24] transition">Sports & Turf</Link></li>
                <li><Link to="/workshops" className="hover:text-[#ED1C24] transition">Workshops</Link></li>
              </ul>
            </div>

            {/* User Hub */}
            <div>
              <h4 className="font-display text-sm font-bold uppercase tracking-wider text-white">
                Customer Hub
              </h4>
              <ul className="mt-4 space-y-2.5 text-xs font-medium text-[#BDBDBD]">
                <li><Link to="/my-bookings" className="hover:text-[#ED1C24] transition">My Bookings</Link></li>
                <li><Link to="/wishlist" className="hover:text-[#ED1C24] transition">Saved Places & Wishlist</Link></li>
                <li><Link to="/rewards" className="hover:text-[#ED1C24] transition">EventX Pass & Rewards</Link></li>
                <li><Link to="/profile" className="hover:text-[#ED1C24] transition">Account Settings</Link></li>
                <li><Link to="/admin/login" className="hover:text-[#ED1C24] transition">Admin Portal</Link></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-display text-sm font-bold uppercase tracking-wider text-white">
                Help & Contact
              </h4>
              <ul className="mt-4 space-y-2.5 text-xs font-medium text-[#BDBDBD]">
                <li className="flex items-center gap-2">
                  <Mail size={13} className="text-[#ED1C24]" />
                  <span>support@eventx.com</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone size={13} className="text-[#ED1C24]" />
                  <span>1800-EVENTX-CARE</span>
                </li>
                <li><span className="text-[#777777]">Terms of Service</span></li>
                <li><span className="text-[#777777]">Privacy Policy</span></li>
                <li><span className="text-[#777777]">Cancellation Policy</span></li>
              </ul>
            </div>
          </div>

          <div className="mt-14 border-t border-[#292929] pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#777777] gap-4">
            <span>© 2026 EventX Entertainment Network. All rights reserved.</span>
            <div className="flex items-center gap-6">
              <span className="hover:text-[#BDBDBD] transition cursor-pointer">Security Audited</span>
              <span className="hover:text-[#BDBDBD] transition cursor-pointer">PCI-DSS Compliant</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
