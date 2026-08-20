import type { EmailJobStatus } from "@prisma/client";

export interface QueueJobPayload {
  emailJobId: string;
}

export interface CampaignCreateInput {
  subject: string;
  body: string;
  recipients: string[];
  startTime: string;
  delayBetweenEmails: number;
  hourlyLimit: number;
}

export type JobStatus = EmailJobStatus;
