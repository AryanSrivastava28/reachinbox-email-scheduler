"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Resolve .env whether the process cwd is the project root or backend/
const envCandidates = [
    path_1.default.resolve(process.cwd(), "backend/.env"),
    path_1.default.resolve(process.cwd(), ".env"),
];
const envPath = envCandidates.find((p) => fs_1.default.existsSync(p));
if (envPath) {
    dotenv_1.default.config({ path: envPath });
}
function required(key, fallback) {
    const value = process.env[key] ?? fallback;
    if (value === undefined || value === "") {
        throw new Error(`Missing required environment variable: ${key}`);
    }
    return value;
}
function int(key, fallback) {
    const raw = process.env[key];
    if (raw === undefined || raw === "")
        return fallback;
    const parsed = Number(raw);
    if (!Number.isFinite(parsed) || !Number.isInteger(parsed)) {
        throw new Error(`Environment variable ${key} must be an integer, got: ${raw}`);
    }
    return parsed;
}
exports.env = {
    port: int("PORT", 5000),
    databaseUrl: required("DATABASE_URL"),
    redis: {
        host: required("REDIS_HOST", "localhost"),
        port: int("REDIS_PORT", 6379),
        password: process.env.REDIS_PASSWORD || undefined,
    },
    google: {
        clientId: required("GOOGLE_CLIENT_ID"),
        clientSecret: required("GOOGLE_CLIENT_SECRET"),
        callbackUrl: required("GOOGLE_CALLBACK_URL"),
    },
    sessionSecret: required("SESSION_SECRET"),
    ethereal: {
        host: required("ETHEREAL_HOST", "smtp.ethereal.email"),
        port: int("ETHEREAL_PORT", 587),
        user: required("ETHEREAL_USER"),
        password: required("ETHEREAL_PASSWORD"),
    },
    workerConcurrency: int("WORKER_CONCURRENCY", 5),
    minEmailDelayMs: int("MIN_EMAIL_DELAY_MS", 2000),
    maxEmailsPerHour: int("MAX_EMAILS_PER_HOUR", 200),
    frontendUrl: required("FRONTEND_URL", "http://localhost:5173"),
};
//# sourceMappingURL=env.js.map