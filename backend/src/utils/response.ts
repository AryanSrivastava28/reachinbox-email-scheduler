import type { Response } from "express";

export function ok<T>(res: Response, data: T, status = 200): Response {
  return res.status(status).json({ success: true, data });
}

export function fail(res: Response, error: string, status = 400): Response {
  return res.status(status).json({ success: false, error });
}

export function paginate<T extends unknown[]>(
  items: T,
  page: number,
  limit: number,
  total: number,
) {
  return {
    items,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}
