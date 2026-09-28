/**
 * Centralized HTTP client for the Express API.
 */

export const API_BASE_URL = (
  import.meta.env["VITE_API_URL"] ?? "http://localhost:4000/api"
).replace(/\/$/, "");

const LATENCY_MS = 220;

export function request<T>(path: string, data: T, latency = LATENCY_MS): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), latency));
}

export async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const token =
    typeof window === "undefined" ? null : window.localStorage.getItem("proctorx.token");
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
    credentials: "include",
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message = payload?.error?.message ?? payload?.message ?? "Request failed";
    throw new ApiError(message, response.status);
  }

  return payload as T;
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}
