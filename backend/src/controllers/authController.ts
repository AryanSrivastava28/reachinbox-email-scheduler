import type { Request, Response, NextFunction } from "express";
import { passport } from "../config/passport";
import { env } from "../config/env";
import { ok } from "../utils/response";

export function googleAuth(req: Request, res: Response, next: NextFunction): void {
  const state = (req.query.redirect as string) || env.frontendUrl;
  passport.authenticate("google", {
    scope: ["profile", "email"],
    state,
  })(req, res, next);
}

export function googleCallback(req: Request, res: Response, next: NextFunction): void {
  const frontendUrl = (req.query.state as string) || env.frontendUrl;
  passport.authenticate("google", {
    failureRedirect: `${env.frontendUrl}/login?error=oauth_failed`,
  })(req, res, (err: unknown) => {
    if (err) return next(err);
    res.redirect(frontendUrl);
  });
}

export function getMe(req: Request, res: Response): void {
  if (!req.user) {
    res.status(401).json({ success: false, error: "Not authenticated" });
    return;
  }
  ok(res, req.user);
}

export function logout(req: Request, res: Response): void {
  req.logout((err) => {
    if (err) {
      res.status(500).json({ success: false, error: "Logout failed" });
      return;
    }
    req.session.destroy(() => {
      res.clearCookie("reachinbox.sid");
      res.json({ success: true, data: { message: "Logged out" } });
    });
  });
}
