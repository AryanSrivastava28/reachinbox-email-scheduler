"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleAuth = googleAuth;
exports.googleCallback = googleCallback;
exports.getMe = getMe;
exports.logout = logout;
const passport_1 = require("../config/passport");
const env_1 = require("../config/env");
const response_1 = require("../utils/response");
function googleAuth(req, res, next) {
    const state = req.query.redirect || env_1.env.frontendUrl;
    passport_1.passport.authenticate("google", {
        scope: ["profile", "email"],
        state,
    })(req, res, next);
}
function googleCallback(req, res, next) {
    const frontendUrl = req.query.state || env_1.env.frontendUrl;
    passport_1.passport.authenticate("google", {
        failureRedirect: `${env_1.env.frontendUrl}/login?error=oauth_failed`,
    })(req, res, (err) => {
        if (err)
            return next(err);
        res.redirect(frontendUrl);
    });
}
function getMe(req, res) {
    if (!req.user) {
        res.status(401).json({ success: false, error: "Not authenticated" });
        return;
    }
    (0, response_1.ok)(res, req.user);
}
function logout(req, res) {
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
//# sourceMappingURL=authController.js.map