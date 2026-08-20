"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.passport = void 0;
const passport_1 = __importDefault(require("passport"));
exports.passport = passport_1.default;
const passport_google_oauth20_1 = require("passport-google-oauth20");
const env_1 = require("./env");
const prisma_1 = require("./prisma");
passport_1.default.use(new passport_google_oauth20_1.Strategy({
    clientID: env_1.env.google.clientId,
    clientSecret: env_1.env.google.clientSecret,
    callbackURL: env_1.env.google.callbackUrl,
}, async (_accessToken, _refreshToken, profile, done) => {
    try {
        const googleId = profile.id;
        const email = profile.emails?.[0]?.value;
        if (!email) {
            return done(new Error("No email returned from Google"));
        }
        const user = await prisma_1.prisma.user.upsert({
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
    }
    catch (err) {
        return done(err);
    }
}));
passport_1.default.serializeUser((user, done) => {
    done(null, user.id);
});
passport_1.default.deserializeUser(async (id, done) => {
    try {
        const user = await prisma_1.prisma.user.findUnique({ where: { id } });
        done(null, user ?? false);
    }
    catch (err) {
        done(err);
    }
});
//# sourceMappingURL=passport.js.map