import { prisma } from "../config/prisma";
import { emailQueue } from "../queues/emailQueue";
import { dedupeRecipients } from "../utils/email";
import type { CreateCampaignInput } from "../utils/validation";

export interface CampaignCreateResult {
  campaignId: string;
  totalEmails: number;
}

export class CampaignService {
  async createCampaign(
    userId: string,
    input: CreateCampaignInput,
  ): Promise<CampaignCreateResult> {
    const recipients = dedupeRecipients(input.recipients);
    if (recipients.length === 0) {
      throw new Error("No valid recipients after deduplication");
    }

    const startTime = new Date(input.startTime);
    const delay = input.delayBetweenEmails;

    const campaign = await prisma.emailCampaign.create({
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

    const emailJobs = await Promise.all(
      recipients.map((recipient, index) => {
        const scheduledAt = new Date(startTime.getTime() + index * delay);
        return prisma.emailJob.create({
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
      }),
    );

    await Promise.all(
      emailJobs.map((job) => {
        const delayMs = Math.max(0, job.scheduledAt.getTime() - Date.now());
        return emailQueue.add(
          "send-email",
          { emailJobId: job.id },
          {
            jobId: job.id, // use DB EmailJob id as BullMQ job id
            delay: delayMs,
          },
        );
      }),
    );

    return {
      campaignId: campaign.id,
      totalEmails: emailJobs.length,
    };
  }

  async getCampaign(userId: string, campaignId: string) {
    const campaign = await prisma.emailCampaign.findFirst({
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

  async listEmails(
    userId: string,
    status: "scheduled" | "sent",
    page: number,
    limit: number,
  ) {
    const where = {
      userId,
      status,
    };

    const [items, total] = await Promise.all([
      prisma.emailJob.findMany({
        where,
        orderBy: { scheduledAt: "asc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.emailJob.count({ where }),
    ]);

    return { items, total, page, limit };
  }
}

export const campaignService = new CampaignService();
