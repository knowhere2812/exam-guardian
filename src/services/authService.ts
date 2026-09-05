import { users, type Role, type User } from "@/data/mockData";
import { ApiError, request } from "./apiClient";

const STORAGE_KEY = "proctorx.session";

export interface Credentials {
  email: string;
  password: string;
  role: Role;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  rollNumber?: string;
}

export const authService = {
  async login({ email, role }: Credentials): Promise<User> {
    const match =
      users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase()) ??
      users.find((u) => u.role === role);
    if (!match) throw new ApiError("Invalid credentials", 401);
    const user = { ...match, role };
    return request("/auth/login", user);
  },

  async register(payload: RegisterPayload): Promise<User> {
    const user: User = {
      id: `u-${Date.now()}`,
      name: payload.name,
      email: payload.email,
      role: "student",
      program: "B.Tech Computer Science",
      rollNumber: payload.rollNumber ?? "CS00B000",
      avatarInitials: payload.name
        .split(" ")
        .map((p) => p[0])
        .slice(0, 2)
        .join("")
        .toUpperCase(),
      joinedAt: new Date().toISOString(),
    };
    return request("/auth/register", user);
  },

  persist(user: User | null) {
    if (typeof window === "undefined") return;
    if (user) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    else window.localStorage.removeItem(STORAGE_KEY);
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
};
