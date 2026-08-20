import { Worker, type Job } from "bullmq";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { redisConnection } from "../config/redis";
import { prisma } from "../config/prisma";
import { env } from "../config/env";
import { EMAIL_QUEUE_NAME } from "../queues/emailQueue";
import type { QueueJobPayload } from "../types";
import { emailSenderService } from "../services/emailSenderService";

const MIN_DELAY_KEY = "email-scheduler:min-send-delay";
const HOURLY_LIMIT_PREFIX = "email-scheduler:hourly";

function getHourWindow(): {
  key: string;
  remainingMs: number;
} {
  const now = Date.now();
  const hourStart = Math.floor(now / 3_600_000) * 3_600_000;
  const nextHour = hourStart + 3_600_000;

  return {
    key: `${HOURLY_LIMIT_PREFIX}:${hourStart}`,
    remainingMs: Math.max(1, nextHour - now),
  };
}

async function waitForMinimumDelay(): Promise<void> {
  const delayMs = Math.max(0, env.minEmailDelayMs);

  if (delayMs === 0) {
    return;
  }

  while (true) {
    const acquired = await redisConnection.set(
      MIN_DELAY_KEY,
      Date.now().toString(),
      "PX",
      delayMs,
      "NX",
    );

    if (acquired === "OK") {
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 100));
  }
}

async function reserveHourlySlot(): Promise<void> {
  const limit = env.maxEmailsPerHour;

  if (limit <= 0) {
    throw new Error("MAX_EMAILS_PER_HOUR must be greater than 0");
  }

  while (true) {
    const { key, remainingMs } = getHourWindow();

    const result = await redisConnection.eval(
      `
      local current = redis.call("GET", KEYS[1])

      if not current then
        redis.call("SET", KEYS[1], "1", "PX", ARGV[2])
        return 1
      end

      current = tonumber(current)

      if current < tonumber(ARGV[1]) then
        return redis.call("INCR", KEYS[1])
      end

      return 0
      `,
      1,
      key,
      String(limit),
      String(remainingMs),
    );

    if (Number(result) > 0) {
      return;
    }

    console.log(
      `[worker] hourly limit reached (${limit}), waiting for next hour`,
    );

    await new Promise((resolve) =>
      setTimeout(resolve, Math.min(remainingMs, 1000)),
    );
  }
}

async function processEmailJob(job: Job<QueueJobPayload>): Promise<void> {
  const { emailJobId } = job.data;

  const emailJob = await prisma.emailJob.findUnique({
    where: { id: emailJobId },
    include: {
      campaign: true,
    },
  });

  if (!emailJob) {
    throw new Error(`EmailJob ${emailJobId} not found`);
  }

  if (emailJob.status === "sent") {
    return;
  }

  await reserveHourlySlot();
  await waitForMinimumDelay();

  const latestJob = await prisma.emailJob.findUnique({
    where: { id: emailJobId },
  });

  if (!latestJob) {
    throw new Error(`EmailJob ${emailJobId} not found`);
  }

  if (latestJob.status === "sent") {
    return;
  }

  await prisma.emailJob.update({
    where: { id: emailJobId },
    data: {
      status: "processing",
      attempts: { increment: 1 },
      errorMessage: null,
    },
  });

  try {
    const result = await emailSenderService.send({
      to: emailJob.recipient,
      subject: emailJob.subject,
      body: emailJob.body,
    });

    await prisma.emailJob.update({
      where: { id: emailJobId },
      data: {
        status: "sent",
        sentAt: new Date(),
        errorMessage: null,
        bullJobId: job.id,
      },
    });

    console.log(
      `[worker] sent job=${emailJobId} to=${emailJob.recipient} messageId=${result.messageId}`,
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);

    await prisma.emailJob.update({
      where: { id: emailJobId },
      data: {
        status: "failed",
        errorMessage: message,
      },
    });

    throw err;
  }
}

export function startEmailWorker(): Worker<QueueJobPayload> {
  const worker = new Worker<QueueJobPayload>(
    EMAIL_QUEUE_NAME,
    async (job: Job<QueueJobPayload>) => processEmailJob(job),
    {
      connection: redisConnection,
      concurrency: env.workerConcurrency,
    },
  );

  worker.on("completed", (job) => {
    console.log(`[worker] completed bullJobId=${job.id}`);
  });

  worker.on("failed", (job, err) => {
    console.error(
      `[worker] failed bullJobId=${job?.id} error=${err.message}`,
    );

    if (err instanceof PrismaClientKnownRequestError) {
      console.error(`[worker] prisma error code=${err.code}`);
    }
  });

  worker.on("error", (err) => {
    console.error(`[worker] error:`, err);
  });

  return worker;
}