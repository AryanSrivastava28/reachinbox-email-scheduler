import type { RequestHandler } from "express";
import type { User } from "@prisma/client";

export interface AuthenticatedRequest extends Express.Request {
  user?: User;
}

export const requireAuth: RequestHandler = (req, res, next) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ success: false, error: "Authentication required" });
};
