import type { RequestHandler } from "express";
import type { ZodType } from "zod";
import { ApiError } from "./errors.js";

export function validateBody<T>(schema: ZodType<T>): RequestHandler {
  return (req, _res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      next(new ApiError(400, "Request validation failed", result.error.flatten()));
      return;
    }
    req.body = result.data;
    next();
  };
}
