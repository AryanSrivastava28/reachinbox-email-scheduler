export interface User {
  id: string;
  googleId: string;
  name: string | null;
  email: string;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export type EmailJobStatus = "scheduled" | "processing" | "sent" | "failed";

export interface EmailJob {
  id: string;
  campaignId: string;
  userId: string;
  recipient: string;
  subject: string;
  body: string;
  scheduledAt: string;
  sentAt: string | null;
  status: EmailJobStatus;
  attempts: number;
  errorMessage: string | null;
  bullJobId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EmailCampaign {
  id: string;
  userId: string;
  subject: string;
  body: string;
  startTime: string;
  delayBetweenEmails: number;
  hourlyLimit: number;
  totalEmails: number;
  createdAt: string;
  updatedAt: string;
  emailJobs: EmailJob[];
}

export interface CampaignCreateResult {
  campaignId: string;
  totalEmails: number;
}

export interface CreateCampaignBody {
  subject: string;
  body: string;
  recipients: string[];
  startTime: string;
  delayBetweenEmails: number;
  hourlyLimit: number;
}

export interface Paginated<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiFailure {
  success: false;
  error: string;
  details?: { path: string; message: string }[];
}

export interface ValidationDetail {
  path: string;
  message: string;
}

export interface StoredCampaign {
  id: string;
  subject: string;
  totalEmails: number;
  createdAt: string;
}
