/**
 * Single place where HTTP will live. Today every call resolves from mock data;
 * swapping in Axios later only requires replacing `request` with a real client.
 *
 *   import axios from "axios";
 *   export const http = axios.create({ baseURL: import.meta.env.VITE_API_URL });
 */

export const API_BASE_URL = "/api";

const LATENCY_MS = 220;

export function request<T>(_path: string, data: T, latency = LATENCY_MS): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), latency));
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}
