import { Queue } from "bullmq";
import { redisConnection } from "../config/redis";
import type { QueueJobPayload } from "../types";

export const EMAIL_QUEUE_NAME = "emailQueue";

export const emailQueue = new Queue<QueueJobPayload>(EMAIL_QUEUE_NAME, {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 5000,
    },
    removeOnComplete: { count: 1000 },
    removeOnFail: { count: 5000 },
  },
});
