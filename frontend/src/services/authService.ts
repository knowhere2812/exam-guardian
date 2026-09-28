import type { Role, User } from "@/data/mockData";
import { fetchJson } from "./apiClient";

const STORAGE_KEY = "proctorx.session";
const TOKEN_KEY = "proctorx.token";

export interface Credentials {
  email: string;
  password: string;
  role: Role;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role?: Role;
  rollNumber?: string;
  department?: string;
}

export const authService = {
  async login({ email, password, role }: Credentials): Promise<User> {
    const response = await fetchJson<{ user: User; token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password, role }),
    });
    this.persist(response.user);
    if (typeof window !== "undefined") window.localStorage.setItem(TOKEN_KEY, response.token);
    return response.user;
  },

  async register(payload: RegisterPayload): Promise<User> {
    const response = await fetchJson<{ user: User; token: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ ...payload, role: payload.role ?? "student" }),
    });
    this.persist(response.user);
    if (typeof window !== "undefined") window.localStorage.setItem(TOKEN_KEY, response.token);
    return response.user;
  },

  async currentUser(): Promise<User> {
    const response = await fetchJson<{ user: User }>("/auth/me");
    return response.user;
  },

  persist(user: User | null) {
    if (typeof window === "undefined") return;
    if (user) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    else {
      window.localStorage.removeItem(STORAGE_KEY);
      window.localStorage.removeItem(TOKEN_KEY);
    }
  },

  restore(): User | null {
    if (typeof window === "undefined") return null;
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  },

  getToken(): string | null {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(TOKEN_KEY);
  },
};
