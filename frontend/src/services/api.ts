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