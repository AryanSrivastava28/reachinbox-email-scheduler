import type {
  CampaignCreateResult,
  CreateCampaignBody,
  EmailCampaign,
} from "../types/api";

import { apiFetch, toJsonBody } from "./api";

export function createCampaign(
  body: CreateCampaignBody,
): Promise<CampaignCreateResult> {
  return apiFetch<CampaignCreateResult>("/api/campaigns", {
    method: "POST",
    body: toJsonBody(body),
  });
}

export function getCampaign(id: string): Promise<EmailCampaign> {
  return apiFetch<EmailCampaign>(
    `/api/campaigns/${encodeURIComponent(id)}`,
  );
}