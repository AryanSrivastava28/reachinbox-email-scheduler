import { Router } from "express";
import { createCampaign, getCampaign } from "../controllers/campaignController";
import { validateBody } from "../middleware/validate";
import { createCampaignSchema } from "../utils/validation";
import { asyncHandler } from "../middleware/asyncHandler";

const router = Router();

router.post("/", validateBody(createCampaignSchema), asyncHandler(createCampaign));
router.get("/:id", asyncHandler(getCampaign));

export default router;
