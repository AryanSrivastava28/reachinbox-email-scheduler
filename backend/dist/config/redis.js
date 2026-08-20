"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sessionRedis = exports.redisConnection = void 0;
exports.pingRedis = pingRedis;
const ioredis_1 = __importDefault(require("ioredis"));
const env_1 = require("./env");
const baseOptions = {
    host: env_1.env.redis.host,
    port: env_1.env.redis.port,
    ...(env_1.env.redis.password ? { password: env_1.env.redis.password } : {}),
    maxRetriesPerRequest: null, // required by BullMQ
    enableReadyCheck: false,
    lazyConnect: false,
};
/**
 * Connection used by BullMQ producers and workers.
 * maxRetriesPerRequest must be null for BullMQ.
 */
exports.redisConnection = new ioredis_1.default(baseOptions);
exports.redisConnection.on("error", (err) => {
    console.error("[redis:bullmq] connection error:", err.message);
});
/**
 * Separate connection for express-session store so BullMQ's
 * maxRetriesPerRequest setting doesn't leak into session lookups.
 */
exports.sessionRedis = new ioredis_1.default({
    ...baseOptions,
    maxRetriesPerRequest: 3,
});
exports.sessionRedis.on("error", (err) => {
    console.error("[redis:session] connection error:", err.message);
});
async function pingRedis() {
    const pong = await exports.redisConnection.ping();
    if (pong !== "PONG") {
        throw new Error(`Redis ping returned unexpected value: ${pong}`);
    }
}
//# sourceMappingURL=redis.js.map