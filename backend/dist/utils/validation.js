"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paginationSchema = exports.createCampaignSchema = void 0;
const zod_1 = require("zod");
const email_1 = require("../utils/email");
exports.createCampaignSchema = zod_1.z
    .object({
    subject: zod_1.z.string().min(1, "subject is required").max(200),
    body: zod_1.z.string().min(1, "body is required"),
    recipients: zod_1.z
        .array(zod_1.z.string().min(1))
        .min(1, "at least one recipient is required"),
    startTime: zod_1.z.string().refine((v) => !isNaN(Date.parse(v)), {
        message: "startTime must be a valid ISO date string",
    }),
    delayBetweenEmails: zod_1.z
        .number()
        .int("delayBetweenEmails must be an integer")
        .min(0, "delayBetweenEmails must be >= 0"),
    hourlyLimit: zod_1.z
        .number()
        .int("hourlyLimit must be an integer")
        .min(1, "hourlyLimit must be >= 1"),
})
    .superRefine((val, ctx) => {
    const invalid = val.recipients.filter((r) => !(0, email_1.isValidEmail)(r));
    if (invalid.length > 0) {
        ctx.addIssue({
            path: ["recipients"],
            code: "custom",
            message: `Invalid email addresses: ${invalid.join(", ")}`,
        });
    }
});
exports.paginationSchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().min(1).default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(200).default(50),
});
//# sourceMappingURL=validation.js.map