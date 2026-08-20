"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.campaignService = exports.CampaignService = void 0;
const prisma_1 = require("../config/prisma");
const emailQueue_1 = require("../queues/emailQueue");
const email_1 = require("../utils/email");
class CampaignService {
    async createCampaign(userId, input) {
        const recipients = (0, email_1.dedupeRecipients)(input.recipients);
        if (recipients.length === 0) {
            throw new Error("No valid recipients after deduplication");
        }
        const startTime = new Date(input.startTime);
        const delay = input.delayBetweenEmails;
        const campaign = await prisma_1.prisma.emailCampaign.create({
            data: {
                userId,
                subject: input.subject,
                body: input.body,
                startTime,
                delayBetweenEmails: delay,
                hourlyLimit: input.hourlyLimit,
                totalEmails: recipients.length,
            },
        });
        const emailJobs = await Promise.all(recipients.map((recipient, index) => {
            const scheduledAt = new Date(startTime.getTime() + index * delay);
            return prisma_1.prisma.emailJob.create({
                data: {
                    campaignId: campaign.id,
                    userId,
                    recipient,
                    subject: input.subject,
                    body: input.body,
                    scheduledAt,
                    status: "scheduled",
                },
            });
        }));
        await Promise.all(emailJobs.map((job) => {
            const delayMs = Math.max(0, job.scheduledAt.getTime() - Date.now());
            return emailQueue_1.emailQueue.add("send-email", { emailJobId: job.id }, {
                jobId: job.id, // use DB EmailJob id as BullMQ job id
                delay: delayMs,
            });
        }));
        return {
            campaignId: campaign.id,
            totalEmails: emailJobs.length,
        };
    }
    async getCampaign(userId, campaignId) {
        const campaign = await prisma_1.prisma.emailCampaign.findFirst({
            where: { id: campaignId, userId },
            include: {
                emailJobs: {
                    orderBy: { scheduledAt: "asc" },
                    take: 200,
                },
            },
        });
        return campaign;
    }
    async listEmails(userId, status, page, limit) {
        const where = {
            userId,
            status,
        };
        const [items, total] = await Promise.all([
            prisma_1.prisma.emailJob.findMany({
                where,
                orderBy: { scheduledAt: "asc" },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma_1.prisma.emailJob.count({ where }),
        ]);
        return { items, total, page, limit };
    }
}
exports.CampaignService = CampaignService;
exports.campaignService = new CampaignService();
//# sourceMappingURL=campaignService.js.map