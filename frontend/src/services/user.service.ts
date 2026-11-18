import { apiRequest } from "./api";
import type { SessionUser } from "../context/AuthContext";

export interface UserProfile extends SessionUser {
  phone?: string | null;
  status?: string;
  createdAt?: string;
}

export const userService = {
  async getProfile(): Promise<UserProfile> {
    return apiRequest<UserProfile>("GET", "/auth/me");
  },

  async updateProfile(payload: { name?: string; phone?: string }): Promise<UserProfile> {
    return apiRequest<UserProfile>("PATCH", "/auth/me", payload);
  },
};
