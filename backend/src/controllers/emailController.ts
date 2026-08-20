import type { Request, Response, NextFunction } from "express";
import { campaignService } from "../services/campaignService";
import { paginationSchema } from "../utils/validation";
import { ok, paginate } from "../utils/response";

export async function listScheduled(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = paginationSchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: "Invalid pagination params" });
      return;
    }
    const { page, limit } = parsed.data;
    const result = await campaignService.listEmails(req.user!.id, "scheduled", page, limit);
    ok(res, paginate(result.items, result.page, result.limit, result.total));
  } catch (err) {
    next(err);
  }
}

export async function listSent(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = paginationSchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: "Invalid pagination params" });
      return;
    }
    const { page, limit } = parsed.data;
    const result = await campaignService.listEmails(req.user!.id, "sent", page, limit);
    ok(res, paginate(result.items, result.page, result.limit, result.total));
  } catch (err) {
    next(err);
  }
}
