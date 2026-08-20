import { Router } from "express";
import { listScheduled, listSent } from "../controllers/emailController";
import { asyncHandler } from "../middleware/asyncHandler";

const router = Router();

router.get("/scheduled", asyncHandler(listScheduled));
router.get("/sent", asyncHandler(listSent));

export default router;
