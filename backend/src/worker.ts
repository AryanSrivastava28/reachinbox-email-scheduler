import { startEmailWorker } from "./workers/emailWorker";
import { pingRedis } from "./config/redis";
import { prisma } from "./config/prisma";
import { env } from "./config/env";

async function main(): Promise<void> {
  try {
    await prisma.$connect();
    console.log("[worker] PostgreSQL connected");
  } catch (err) {
    console.error("[worker] PostgreSQL connection failed:", err);
    process.exit(1);
  }

  try {
    await pingRedis();
    console.log("[worker] Redis connected");
  } catch (err) {
    console.error("[worker] Redis connection failed:", err);
    process.exit(1);
  }

  const worker = startEmailWorker();
  console.log(
    `[worker] email worker started (concurrency=${env.workerConcurrency})`,
  );

  const shutdown = (signal: string) => {
    console.log(`[worker] ${signal} received, shutting down`);
    worker
      .close()
      .then(() => prisma.$disconnect())
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
