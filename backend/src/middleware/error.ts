import type { Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";

export interface AppError extends Error {
  status?: number;
}

export function notFound(_req: Request, res: Response): void {
  res.status(404).json({ success: false, error: "Resource not found" });
}

export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const status = err.status ?? 500;
  const message =
    status >= 500 && process.env.NODE_ENV === "production"
      ? "Internal server error"
      : err.message ?? "Internal server error";

  if (status >= 500) {
    console.error("[error]", err);
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    res.status(400).json({ success: false, error: `Database error: ${err.code}` });
    return;
  }

  res.status(status).json({ success: false, error: message });
}

export function createError(status: number, message: string): AppError {
  const error: AppError = new Error(message);
  error.status = status;
  return error;
}
