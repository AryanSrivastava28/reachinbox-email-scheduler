import { Worker, type Job } from "bullmq";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { redisConnection } from "../config/redis";
import { prisma } from "../config/prisma";
import { env } from "../config/env";
import { EMAIL_QUEUE_NAME } from "../queues/emailQueue";
import type { QueueJobPayload } from "../types";
import { emailSenderService } from "../services/emailSenderService";

async function processEmailJob(job: Job<QueueJobPayload>): Promise<void> {
  const { emailJobId } = job.data;

  const emailJob = await prisma.emailJob.findUnique({
    where: { id: emailJobId },
  });

  if (!emailJob) {
    throw new Error(`EmailJob ${emailJobId} not found`);
  }

  if (emailJob.status === "sent") {
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
    console.error(`[worker] failed bullJobId=${job?.id} error=${err.message}`);
    if (err instanceof PrismaClientKnownRequestError) {
      console.error(`[worker] prisma error code=${err.code}`);
    }
  });

  worker.on("error", (err) => {
    console.error(`[worker] error:`, err);
  });

  return worker;
}
