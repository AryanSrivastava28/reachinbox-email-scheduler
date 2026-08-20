import IORedis, { type RedisOptions } from "ioredis";
import { env } from "./env";

const baseOptions: RedisOptions = {
  host: env.redis.host,
  port: env.redis.port,
  ...(env.redis.password ? { password: env.redis.password } : {}),
  maxRetriesPerRequest: null, // required by BullMQ
  enableReadyCheck: false,
  lazyConnect: false,
};

/**
 * Connection used by BullMQ producers and workers.
 * maxRetriesPerRequest must be null for BullMQ.
 */
export const redisConnection = new IORedis(baseOptions);

/**
 * Separate connection for express-session store so BullMQ's
 * maxRetriesPerRequest setting doesn't leak into session lookups.
 */
export const sessionRedis = new IORedis({
  ...baseOptions,
  maxRetriesPerRequest: 3,
});

export async function pingRedis(): Promise<void> {
  const pong = await redisConnection.ping();
  if (pong !== "PONG") {
    throw new Error(`Redis ping returned unexpected value: ${pong}`);
  }
}
