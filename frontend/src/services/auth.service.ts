import { apiRequest } from "./api";
import type { SessionUser } from "../context/AuthContext";

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
  accountType?: "CUSTOMER" | "ORGANIZER";
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: SessionUser;
}

export const authService = {
  async login(email: string, password: string): Promise<AuthTokens> {
    return apiRequest<AuthTokens>("POST", "/auth/login", { email, password });
  },

  async register(payload: RegisterPayload): Promise<AuthTokens> {
    return apiRequest<AuthTokens>("POST", "/auth/register", {
      ...payload,
      accountType: payload.accountType ?? "CUSTOMER",
    });
  },

  async refresh(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    return apiRequest<{ accessToken: string; refreshToken: string }>("POST", "/auth/refresh", { refreshToken });
  },

  async logout(refreshToken: string): Promise<void> {
    await apiRequest("POST", "/auth/logout", { refreshToken });
  },

  async me(): Promise<SessionUser> {
    return apiRequest<SessionUser>("GET", "/auth/me");
  },

  async updateProfile(payload: { name?: string; phone?: string }): Promise<SessionUser> {
    return apiRequest<SessionUser>("PATCH", "/auth/me", payload);
  },
};
