import nodemailer from "nodemailer";
import { env } from "../configs/env";
import { EmailJob } from "../types/email";

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_SECURE,

  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },

  pool: true,
  maxConnections: 5,
  maxMessages: 100,

  tls: {
    rejectUnauthorized: false,
  },
});

export async function sendMail(options: EmailJob) {
  const info = await transporter.sendMail({
    from: env.MAIL_FROM,
    to: options.to,
    subject: options.subject,
    html: options.html,
    cc: options.cc,
    bcc: options.bcc,
  });

  return {
    messageId: info.messageId,
    accepted: info.accepted,
    rejected: info.rejected,
  };
}
