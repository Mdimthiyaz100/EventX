import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { apiRequest, AUTH_TOKEN_KEY, REFRESH_TOKEN_KEY } from "../services/api";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: "CUSTOMER" | "ORGANIZER" | "ADMIN";
}

interface AuthContextValue {
  user: SessionUser | null;
  loading: boolean;
  login: (email: string, password: string, requiredRole?: "ADMIN" | "CUSTOMER") => Promise<SessionUser>;
  register: (payload: { name: string; email: string; password: string; phone?: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!token) { setLoading(false); return; }
    void apiRequest<SessionUser>("GET", "/auth/me")
      .then(setUser)
      .catch(() => { localStorage.removeItem(AUTH_TOKEN_KEY); setUser(null); })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const onUnauthorized = () => setUser(null);
    window.addEventListener("eventx:unauthorized", onUnauthorized);
    return () => window.removeEventListener("eventx:unauthorized", onUnauthorized);
  }, []);

  const login = useCallback(async (email: string, password: string, requiredRole?: "ADMIN" | "CUSTOMER") => {
    const result = await apiRequest<{ accessToken: string; refreshToken: string; user: SessionUser }>("POST", "/auth/login", { email, password });
    if (requiredRole === "ADMIN" && result.user.role !== "ADMIN") {
      await apiRequest("POST", "/auth/logout", { refreshToken: result.refreshToken }).catch(() => undefined);
      throw new Error("This account does not have administrator access.");
    }
    localStorage.setItem(AUTH_TOKEN_KEY, result.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, result.refreshToken);
    setUser(result.user);
    return result.user;
  }, []);

  const register = useCallback(async (payload: { name: string; email: string; password: string; phone?: string }) => {
    await apiRequest<{ accessToken: string; refreshToken: string; user: SessionUser }>("POST", "/auth/register", {
      ...payload,
      accountType: "CUSTOMER",
    });
  }, []);

  const logout = useCallback(() => {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (refreshToken) void apiRequest("POST", "/auth/logout", { refreshToken }).catch(() => undefined);
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, loading, login, register, logout }), [user, loading, login, register, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider.");
  return context;
}
