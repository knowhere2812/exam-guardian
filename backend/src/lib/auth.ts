import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export type BackendRole = "STUDENT" | "ADMIN";
export type FrontendRole = "student" | "admin";

export interface JwtUserPayload {
  id: string;
  email: string;
  role: BackendRole;
}

export function normalizeRole(role: string | undefined | null): FrontendRole {
  const value = String(role ?? "").toUpperCase();
  if (value === "ADMIN") return "admin";
  return "student";
}

export function toBackendRole(role: FrontendRole | string | undefined | null): BackendRole {
  return String(role ?? "student").toUpperCase() === "ADMIN" ? "ADMIN" : "STUDENT";
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function comparePasswordHash(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function signJwt(payload: JwtUserPayload) {
  return jwt.sign(
    payload as object,
    env.JWT_SECRET as jwt.Secret,
    {
      expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
    } as jwt.SignOptions,
  );
}

export function verifyJwt(token: string): JwtUserPayload {
  const decoded = jwt.verify(token, env.JWT_SECRET as jwt.Secret) as JwtUserPayload;
  return decoded;
}
