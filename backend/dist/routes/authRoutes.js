"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const passport_1 = require("../config/passport");
const authController_1 = require("../controllers/authController");
const router = (0, express_1.Router)();
router.get("/google", authController_1.googleAuth);
router.get("/google/callback", authController_1.googleCallback);
router.get("/me", passport_1.passport.authenticate("session", { session: true }), authController_1.getMe);
router.post("/logout", authController_1.logout);
exports.default = router;
//# sourceMappingURL=authRoutes.js.map