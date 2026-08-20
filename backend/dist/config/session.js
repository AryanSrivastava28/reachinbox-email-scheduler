"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sessionMiddleware = void 0;
const express_session_1 = __importDefault(require("express-session"));
const connect_redis_1 = require("connect-redis");
const env_1 = require("./env");
const redis_1 = require("./redis");
exports.sessionMiddleware = (0, express_session_1.default)({
    store: new connect_redis_1.RedisStore({ client: redis_1.sessionRedis, prefix: "sess:" }),
    secret: env_1.env.sessionSecret,
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
//# sourceMappingURL=session.js.map