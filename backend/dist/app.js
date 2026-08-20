"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const env_1 = require("./config/env");
const session_1 = require("./config/session");
const passport_1 = require("./config/passport");
const error_1 = require("./middleware/error");
const validate_1 = require("./middleware/validate");
const auth_1 = require("./middleware/auth");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const campaignRoutes_1 = __importDefault(require("./routes/campaignRoutes"));
const emailRoutes_1 = __importDefault(require("./routes/emailRoutes"));
function createApp() {
    const app = (0, express_1.default)();
    app.use((0, helmet_1.default)());
    app.use((0, cors_1.default)({
        origin: env_1.env.frontendUrl,
        credentials: true,
    }));
    app.use(express_1.default.json({ limit: "1mb" }));
    app.use((0, cookie_parser_1.default)());
    app.use(session_1.sessionMiddleware);
    app.use(passport_1.passport.initialize());
    app.use(passport_1.passport.session());
    app.get("/health", (_req, res) => {
        res.json({ success: true, data: { status: "ok" } });
    });
    app.use("/api/auth", authRoutes_1.default);
    // Protected routes
    app.use("/api/campaigns", auth_1.requireAuth, campaignRoutes_1.default);
    app.use("/api/emails", auth_1.requireAuth, emailRoutes_1.default);
    app.use(error_1.notFound);
    app.use(validate_1.zodErrorHandler);
    app.use(error_1.errorHandler);
    return app;
}
//# sourceMappingURL=app.js.map