import { type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface PublicRouteProps {
  children: ReactNode;
  restrictedToGuest?: boolean;
}

export default function PublicRoute({
  children,
  restrictedToGuest = false,
}: PublicRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0C0C0E] text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="size-8 animate-spin rounded-full border-2 border-white/20 border-t-[#E31824]" />
          <span className="text-xs font-semibold text-white/50">Verifying session…</span>
        </div>
      </div>
    );
  }

  if (user && restrictedToGuest) {
    // Redirect authenticated users to their corresponding dashboard or home
    if (user.role === "ADMIN") {
      return <Navigate to="/admin/dashboard" replace />;
    }
    if (user.role === "ORGANIZER") {
      return <Navigate to="/organizer/dashboard" replace />;
    }
    const fromPath = (location.state as { from?: { pathname?: string } })?.from?.pathname;
    return <Navigate to={fromPath || "/"} replace />;
  }

  return <>{children}</>;
}
