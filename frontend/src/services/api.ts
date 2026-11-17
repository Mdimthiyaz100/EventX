import axios, { type AxiosError } from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ?? "/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15_000,
  withCredentials: true,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

export const AUTH_TOKEN_KEY = "eventx.accessToken";
export const REFRESH_TOKEN_KEY = "eventx.refreshToken";
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let refreshPromise: Promise<string> | null = null;
api.interceptors.response.use((response) => response, async (error: AxiosError) => {
  const request = error.config as (AxiosError["config"] & { _eventxRetried?: boolean }) | undefined;
  const url = request?.url ?? "";
  if (error.response?.status !== 401 || !request || request._eventxRetried || /\/auth\/(login|refresh|logout)/.test(url)) throw error;
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  if (!refreshToken) throw error;
  request._eventxRetried = true;
  try {
    if (!refreshPromise) {
      refreshPromise = api.post<{ success: true; data: { accessToken: string; refreshToken: string } }>("/auth/refresh", { refreshToken })
        .then((response) => {
          const tokens = response.data.data;
          localStorage.setItem(AUTH_TOKEN_KEY, tokens.accessToken);
          localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
          return tokens.accessToken;
        }).catch((refreshError) => {
          localStorage.removeItem(AUTH_TOKEN_KEY);
          localStorage.removeItem(REFRESH_TOKEN_KEY);
          window.dispatchEvent(new Event("eventx:unauthorized"));
          throw refreshError;
        }).finally(() => { refreshPromise = null; });
    }
    const accessToken = await refreshPromise;
    request.headers.Authorization = `Bearer ${accessToken}`;
    return api.request(request);
  } catch (refreshError) { throw refreshError; }
});

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiGet(
  path: string,
  signal?: AbortSignal,
): Promise<unknown> {
  try {
    const response = await api.get<unknown>(path, { signal });
    const body = response.data;
    if (
      typeof body === "object" &&
      body !== null &&
      "success" in body &&
      body.success === true &&
      "data" in body
    ) {
      return body.data;
    }
    return body;
  } catch (error) {
    const axiosError = error as AxiosError<{
      error?: { code?: string; message?: string };
    }>;
    if (axios.isAxiosError(axiosError)) {
      throw new ApiError(
        axiosError.response?.data?.error?.message ??
          axiosError.message ??
          "The API request failed.",
        axiosError.response?.status ?? 0,
        axiosError.response?.data?.error?.code,
      );
    }
    throw error;
  }
}

export async function apiRequest<T>(
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
  path: string,
  data?: unknown,
  params?: Record<string, string | number | boolean | undefined>,
): Promise<T> {
  try {
    const response = await api.request<unknown>({ method, url: path, data, params });
    const body = response.data;
    if (typeof body === "object" && body !== null && "success" in body && body.success === true && "data" in body) {
      return body.data as T;
    }
    return body as T;
  } catch (error) {
    const axiosError = error as AxiosError<{ error?: { code?: string; message?: string } }>;
    if (axios.isAxiosError(axiosError)) {
      throw new ApiError(axiosError.response?.data?.error?.message ?? axiosError.message ?? "The API request failed.", axiosError.response?.status ?? 0, axiosError.response?.data?.error?.code);
    }
    throw error;
  }
}

export async function apiUpload<T>(path: string, form: FormData): Promise<T> {
  try {
    const response = await api.post<unknown>(path, form, { headers: { "Content-Type": "multipart/form-data" } });
    const body = response.data;
    if (typeof body === "object" && body !== null && "success" in body && body.success === true && "data" in body) return body.data as T;
    return body as T;
  } catch (error) {
    const axiosError = error as AxiosError<{ error?: { code?: string; message?: string } }>;
    if (axios.isAxiosError(axiosError)) throw new ApiError(axiosError.response?.data?.error?.message ?? axiosError.message ?? "The image upload failed.", axiosError.response?.status ?? 0, axiosError.response?.data?.error?.code);
    throw error;
  }
}
