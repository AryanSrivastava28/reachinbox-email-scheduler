import express, { type Express } from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "./config/env";
import { sessionMiddleware } from "./config/session";
import { passport } from "./config/passport";
import { notFound, errorHandler } from "./middleware/error";
import { zodErrorHandler } from "./middleware/validate";
import { requireAuth } from "./middleware/auth";
import authRoutes from "./routes/authRoutes";
import campaignRoutes from "./routes/campaignRoutes";
import emailRoutes from "./routes/emailRoutes";

export function createApp(): Express {
  const app = express();
  app.set("trust proxy", 1);

  app.use(helmet());
  app.use(
    cors({
      origin: env.frontendUrl,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(cookieParser());
  app.use(sessionMiddleware);
  app.use(passport.initialize());
  app.use(passport.session());

  app.get("/health", (_req, res) => {
    res.json({ success: true, data: { status: "ok" } });
  });

  app.use("/api/auth", authRoutes);

  // Protected routes
  app.use("/api/campaigns", requireAuth, campaignRoutes);
  app.use("/api/emails", requireAuth, emailRoutes);

  app.use(notFound);
  app.use(zodErrorHandler);
  app.use(errorHandler);

  return app;
}
