import { createApp } from "./app";
import { env } from "./config/env";
import { pingRedis } from "./config/redis";
import { prisma } from "./config/prisma";

async function main(): Promise<void> {
  try {
    await prisma.$connect();
    console.log("[server] PostgreSQL connected");
  } catch (err) {
    console.error("[server] PostgreSQL connection failed:", err);
    process.exit(1);
  }

  try {
    await pingRedis();
    console.log("[server] Redis connected");
  } catch (err) {
    console.error("[server] Redis connection failed:", err);
    process.exit(1);
  }

  const app = createApp();

  const server = app.listen(env.port, () => {
    console.log(`[server] API listening on http://localhost:${env.port}`);
  });

  const shutdown = (signal: string) => {
    console.log(`[server] ${signal} received, shutting down`);
    server.close(() => {
      prisma.$disconnect().finally(() => process.exit(0));
    });
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

main().catch((err) => {
  console.error("[server] fatal:", err);
  process.exit(1);
});
