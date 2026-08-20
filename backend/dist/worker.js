"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const emailWorker_1 = require("./workers/emailWorker");
const redis_1 = require("./config/redis");
const prisma_1 = require("./config/prisma");
const env_1 = require("./config/env");
async function main() {
    try {
        await prisma_1.prisma.$connect();
        console.log("[worker] PostgreSQL connected");
    }
    catch (err) {
        console.error("[worker] PostgreSQL connection failed:", err);
        process.exit(1);
    }
    try {
        await (0, redis_1.pingRedis)();
        console.log("[worker] Redis connected");
    }
    catch (err) {
        console.error("[worker] Redis connection failed:", err);
        process.exit(1);
    }
    const worker = (0, emailWorker_1.startEmailWorker)();
    console.log(`[worker] email worker started (concurrency=${env_1.env.workerConcurrency})`);
    const shutdown = (signal) => {
        console.log(`[worker] ${signal} received, shutting down`);
        worker
            .close()
            .then(() => prisma_1.prisma.$disconnect())
            .then(() => process.exit(0))
            .catch((err) => {
            console.error("[worker] shutdown error:", err);
            process.exit(1);
        });
    };
    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
}
main().catch((err) => {
    console.error("[worker] fatal:", err);
    process.exit(1);
});
//# sourceMappingURL=worker.js.map