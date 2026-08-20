import type { Request, Response, NextFunction } from "express";
import { campaignService } from "../services/campaignService";
import { createCampaignSchema } from "../utils/validation";
import { ok } from "../utils/response";
import { createError } from "../middleware/error";

export async function createCampaign(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = createCampaignSchema.safeParse(req.body);
    if (!parsed.success) {
      throw createError(400, parsed.error.errors[0]?.message ?? "Invalid input");
    }

    const user = req.user!;
    const result = await campaignService.createCampaign(user.id, parsed.data);

    ok(res, result, 201);
  } catch (err) {
    next(err);
  }
}

export async function getCampaign(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const user = req.user!;
    const campaign = await campaignService.getCampaign(user.id, String(req.params.id));
    if (!campaign) {
      throw createError(404, "Campaign not found");
    }
    ok(res, campaign);
  } catch (err) {
    next(err);
  }
}
