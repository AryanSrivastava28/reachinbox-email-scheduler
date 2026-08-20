import type { EmailJob, Paginated } from "../types/api";
import { apiFetch } from "./api";

export function listScheduledEmails(
  page = 1,
  limit = 50,
): Promise<Paginated<EmailJob>> {
  return apiFetch<Paginated<EmailJob>>(
    `/api/emails/scheduled?page=${page}&limit=${limit}`,
  );
}

export function listSentEmails(
  page = 1,
  limit = 50,
): Promise<Paginated<EmailJob>> {
  return apiFetch<Paginated<EmailJob>>(
    `/api/emails/sent?page=${page}&limit=${limit}`,
  );
}
