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

  async getSecurityQuestions(): Promise<Array<{ id: string; question: string }>> {
    return apiRequest<Array<{ id: string; question: string }>>("GET", "/auth/security-questions");
  },

  async getSecurityStatus(): Promise<{ hasSecurityQuestions: boolean; count: number }> {
    return apiRequest<{ hasSecurityQuestions: boolean; count: number }>("GET", "/auth/security-status");
  },

  async setupSecurityQuestions(answers: Array<{ questionId: string; answer: string }>): Promise<{ success: boolean; message: string }> {
    return apiRequest<{ success: boolean; message: string }>("POST", "/auth/setup-security-questions", { answers });
  },

  async updateSecurityQuestions(answers: Array<{ questionId: string; answer: string }>): Promise<{ success: boolean; message: string }> {
    return apiRequest<{ success: boolean; message: string }>("PUT", "/auth/update-security-questions", { answers });
  },

  async forgotPassword(email: string): Promise<{ hasQuestions: boolean; questions: Array<{ questionId: string; question: string }> }> {
    return apiRequest<{ hasQuestions: boolean; questions: Array<{ questionId: string; question: string }> }>("POST", "/auth/forgot-password", { email });
  },

  async verifySecurityAnswers(email: string, answers: Array<{ questionId: string; answer: string }>): Promise<{ verified: boolean; recoveryToken: string; expiresIn: number }> {
    return apiRequest<{ verified: boolean; recoveryToken: string; expiresIn: number }>("POST", "/auth/verify-security-answers", { email, answers });
  },

  async resetPasswordSecurity(recoveryToken: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    return apiRequest<{ success: boolean; message: string }>("POST", "/auth/reset-password-security", { recoveryToken, newPassword });
  },
};
