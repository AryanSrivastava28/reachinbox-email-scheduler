import nodemailer from "nodemailer";
import { env } from "../config/env";

export interface SendResult {
  messageId: string;
  previewUrl?: string;
}

let cachedTransport: nodemailer.Transporter | null = null;

function getTransport(): nodemailer.Transporter {
  if (cachedTransport) return cachedTransport;

  cachedTransport = nodemailer.createTransport({
    host: env.ethereal.host,
    port: env.ethereal.port,
    secure: env.ethereal.port === 465,
    auth: {
      user: env.ethereal.user,
      pass: env.ethereal.password,
    },
  });

  return cachedTransport;
}

export class EmailSenderService {
  async send(opts: {
    to: string;
    subject: string;
    body: string;
  }): Promise<SendResult> {
    const transport = getTransport();

    const info = await transport.sendMail({
      from: `"ReachInbox Scheduler" <${env.ethereal.user}>`,
      to: opts.to,
      subject: opts.subject,
      text: opts.body,
      html: `<pre>${escapeHtml(opts.body)}</pre>`,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info) ?? undefined;

    return {
      messageId: info.messageId,
      previewUrl: typeof previewUrl === "string" ? previewUrl : undefined,
    };
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export const emailSenderService = new EmailSenderService();
