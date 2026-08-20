"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startEmailWorker = startEmailWorker;
const bullmq_1 = require("bullmq");
const library_1 = require("@prisma/client/runtime/library");
const redis_1 = require("../config/redis");
const prisma_1 = require("../config/prisma");
const env_1 = require("../config/env");
const emailQueue_1 = require("../queues/emailQueue");
const emailSenderService_1 = require("../services/emailSenderService");
async function processEmailJob(job) {
    const { emailJobId } = job.data;
    const emailJob = await prisma_1.prisma.emailJob.findUnique({
        where: { id: emailJobId },
    });
    if (!emailJob) {
        throw new Error(`EmailJob ${emailJobId} not found`);
    }
    if (emailJob.status === "sent") {
        return;
    }
    await prisma_1.prisma.emailJob.update({
        where: { id: emailJobId },
        data: {
            status: "processing",
            attempts: { increment: 1 },
            errorMessage: null,
        },
    });
    try {
        const result = await emailSenderService_1.emailSenderService.send({
            to: emailJob.recipient,
            subject: emailJob.subject,
            body: emailJob.body,
        });
        await prisma_1.prisma.emailJob.update({
            where: { id: emailJobId },
            data: {
                status: "sent",
                sentAt: new Date(),
                errorMessage: null,
                bullJobId: job.id,
            },
        });
        console.log(`[worker] sent job=${emailJobId} to=${emailJob.recipient} messageId=${result.messageId}`);
    }
    catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        await prisma_1.prisma.emailJob.update({
            where: { id: emailJobId },
            data: {
                status: "failed",
                errorMessage: message,
            },
        });
        throw err;
    }
}
function startEmailWorker() {
    const worker = new bullmq_1.Worker(emailQueue_1.EMAIL_QUEUE_NAME, async (job) => processEmailJob(job), {
        connection: redis_1.redisConnection,
        concurrency: env_1.env.workerConcurrency,
    });
    worker.on("completed", (job) => {
        console.log(`[worker] completed bullJobId=${job.id}`);
    });
    worker.on("failed", (job, err) => {
        console.error(`[worker] failed bullJobId=${job?.id} error=${err.message}`);
        if (err instanceof library_1.PrismaClientKnownRequestError) {
            console.error(`[worker] prisma error code=${err.code}`);
        }
    });
    worker.on("error", (err) => {
        console.error(`[worker] error:`, err);
    });
    return worker;
}
//# sourceMappingURL=emailWorker.js.map