import passport from "passport";
import {
  Strategy as GoogleStrategy,
  type Profile,
  type VerifyCallback,
} from "passport-google-oauth20";
import { env } from "./env";
import { prisma } from "./prisma";
import type { User } from "@prisma/client";

passport.use(
  new GoogleStrategy(
    {
      clientID: env.google.clientId,
      clientSecret: env.google.clientSecret,
      callbackURL: env.google.callbackUrl,
    },
    async (
      _accessToken: string,
      _refreshToken: string,
      profile: Profile,
      done: VerifyCallback,
    ) => {
      try {
        const googleId = profile.id;
        const email = profile.emails?.[0]?.value;
        if (!email) {
          return done(new Error("No email returned from Google"));
        }

        const user = await prisma.user.upsert({
          where: { googleId },
          create: {
            googleId,
            email,
            name: profile.displayName,
            avatarUrl: profile.photos?.[0]?.value ?? null,
          },
          update: {
            email,
            name: profile.displayName ?? undefined,
            avatarUrl: profile.photos?.[0]?.value ?? null,
          },
        });

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    },
  ),
);

passport.serializeUser((user, done) => {
  done(null, (user as User).id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user ?? false);
  } catch (err) {
    done(err);
  }
});

export { passport };
