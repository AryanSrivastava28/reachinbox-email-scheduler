import { Router } from "express";
import { passport } from "../config/passport";
import { googleAuth, googleCallback, getMe, logout } from "../controllers/authController";

const router = Router();

router.get("/google", googleAuth);
router.get("/google/callback", googleCallback);
router.get("/me", passport.authenticate("session", { session: true }), getMe);
router.post("/logout", logout);

export default router;
