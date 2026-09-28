import type { ErrorRequestHandler } from "express";

export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export const notFoundHandler = (req: import("express").Request, _res: import("express").Response, next: import("express").NextFunction) => {
  next(new ApiError(404, `Route not found: ${req.method} ${req.path}`));
};

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  const statusCode = error instanceof ApiError ? error.statusCode : 500;
  if (statusCode >= 500) console.error(error);
  res.status(statusCode).json({
    error: {
      message: statusCode === 500 ? "Internal server error" : error.message,
      ...(error instanceof ApiError && error.details ? { details: error.details } : {}),
    },
  });
};
