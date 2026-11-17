import { useState, type ReactNode } from "react";
import AdminSidebar from "../components/admin/AdminSidebar";
import AdminNavbar from "../components/admin/AdminNavbar";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#FCF9F4] font-sans text-[#171717] antialiased">
      {/* Sidebar (Desktop persistent + Mobile drawer) */}
      <AdminSidebar
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="min-h-screen flex flex-col lg:pl-[250px]">
        {/* Top Navbar */}
        <AdminNavbar
          onMobileMenuToggle={() => setMobileSidebarOpen((prev) => !prev)}
        />

        {/* Main Content View */}
        <main className="flex-1 px-4 py-6 sm:px-8 sm:py-8">
          <div className="mx-auto max-w-[1520px]">
            {children}
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-[#eee7dc]/80 py-4 text-center text-xs text-slate-400">
          <p>
            EventX Admin Portal · Premium Entertainment Operations & Catalog Management
          </p>
        </footer>
      </div>
    </div>
  );
}
