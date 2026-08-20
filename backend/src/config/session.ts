import session from "express-session";
import { RedisStore } from "connect-redis";
import { env } from "./env";
import { sessionRedis } from "./redis";

export const sessionMiddleware = session({
  store: new RedisStore({ client: sessionRedis as never, prefix: "sess:" }),
  secret: env.sessionSecret,
  resave: false,
  saveUninitialized: false,
  name: "reachinbox.sid",
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
  },
});
