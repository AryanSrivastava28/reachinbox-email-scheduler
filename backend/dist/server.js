"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const env_1 = require("./config/env");
const redis_1 = require("./config/redis");
const prisma_1 = require("./config/prisma");
async function main() {
    try {
        await prisma_1.prisma.$connect();
        console.log("[server] PostgreSQL connected");
    }
    catch (err) {
        console.error("[server] PostgreSQL connection failed:", err);
        process.exit(1);
    }
    try {
        await (0, redis_1.pingRedis)();
        console.log("[server] Redis connected");
    }
    catch (err) {
        console.error("[server] Redis connection failed:", err);
        process.exit(1);
    }
    const app = (0, app_1.createApp)();
    const server = app.listen(env_1.env.port, () => {
        console.log(`[server] API listening on http://localhost:${env_1.env.port}`);
    });
    const shutdown = (signal) => {
        console.log(`[server] ${signal} received, shutting down`);
        server.close(() => {
            prisma_1.prisma.$disconnect().finally(() => process.exit(0));
        });
    };
    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
}
main().catch((err) => {
    console.error("[server] fatal:", err);
    process.exit(1);
});
//# sourceMappingURL=server.js.map