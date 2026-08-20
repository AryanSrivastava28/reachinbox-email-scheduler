import { z } from "zod";
import { isValidEmail } from "../utils/email";

export const createCampaignSchema = z
  .object({
    subject: z.string().min(1, "subject is required").max(200),
    body: z.string().min(1, "body is required"),
    recipients: z
      .array(z.string().min(1))
      .min(1, "at least one recipient is required"),
    startTime: z.string().refine((v) => !isNaN(Date.parse(v)), {
      message: "startTime must be a valid ISO date string",
    }),
    delayBetweenEmails: z
      .number()
      .int("delayBetweenEmails must be an integer")
      .min(0, "delayBetweenEmails must be >= 0"),
    hourlyLimit: z
      .number()
      .int("hourlyLimit must be an integer")
      .min(1, "hourlyLimit must be >= 1"),
  })
  .superRefine((val, ctx) => {
    const invalid = val.recipients.filter((r) => !isValidEmail(r));
    if (invalid.length > 0) {
      ctx.addIssue({
        path: ["recipients"],
        code: "custom",
        message: `Invalid email addresses: ${invalid.join(", ")}`,
      });
    }
  });

export type CreateCampaignInput = z.infer<typeof createCampaignSchema>;

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(200).default(50),
});
