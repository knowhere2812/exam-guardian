import type { NextFunction, Request, Response } from "express";
import { ApiError } from "./errors.js";
import { verifyJwt } from "../lib/auth.js";

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization ?? "";
  const token = header.startsWith("Bearer ") ? header.slice("Bearer ".length).trim() : "";

  if (!token) {
    return next(new ApiError(401, "Authentication required"));
  }

  try {
    const payload = verifyJwt(token);
    (req as Request & { user?: { id: string; email: string; role: string } }).user = payload;
    return next();
  } catch {
    return next(new ApiError(401, "Invalid or expired token"));
  }
}
