"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailSenderService = exports.EmailSenderService = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const env_1 = require("../config/env");
let cachedTransport = null;
function getTransport() {
    if (cachedTransport)
        return cachedTransport;
    cachedTransport = nodemailer_1.default.createTransport({
        host: env_1.env.ethereal.host,
        port: env_1.env.ethereal.port,
        secure: env_1.env.ethereal.port === 465,
        auth: {
            user: env_1.env.ethereal.user,
            pass: env_1.env.ethereal.password,
        },
    });
    return cachedTransport;
}
class EmailSenderService {
    async send(opts) {
        const transport = getTransport();
        const info = await transport.sendMail({
            from: `"ReachInbox Scheduler" <${env_1.env.ethereal.user}>`,
            to: opts.to,
            subject: opts.subject,
            text: opts.body,
            html: `<pre>${escapeHtml(opts.body)}</pre>`,
        });
        const previewUrl = nodemailer_1.default.getTestMessageUrl(info) ?? undefined;
        return {
            messageId: info.messageId,
            previewUrl: typeof previewUrl === "string" ? previewUrl : undefined,
        };
    }
}
exports.EmailSenderService = EmailSenderService;
function escapeHtml(s) {
    return s
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}
exports.emailSenderService = new EmailSenderService();
//# sourceMappingURL=emailSenderService.js.map