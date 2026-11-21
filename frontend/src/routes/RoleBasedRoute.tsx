import { type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export type AllowedUserRole = "CUSTOMER" | "ORGANIZER" | "ADMIN";

interface RoleBasedRouteProps {
  allowedRoles: AllowedUserRole[];
  redirectTo?: string;
  children: ReactNode;
}

export default function RoleBasedRoute({
  allowedRoles,
  redirectTo,
  children,
}: RoleBasedRouteProps) {
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

  if (!user) {
    const target = redirectTo || (allowedRoles.includes("ADMIN") ? "/admin/login" : "/login");
    return <Navigate to={target} state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // Role mismatch: redirect appropriately based on actual role
    if (user.role === "ADMIN") {
      return <Navigate to="/admin/dashboard" replace />;
    }
    if (user.role === "ORGANIZER") {
      return <Navigate to="/organizer/dashboard" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
