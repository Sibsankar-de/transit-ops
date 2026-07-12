import { env } from "../configs/env";
import { sendMail } from "../lib/mailer";
import { getChannel } from "../lib/rabbit";
import { EmailJob } from "../types/email";
import { createModuleLogger } from "../utils/logger";

const log = createModuleLogger(import.meta.url);

const QUEUE = env.RABBITMQ_EMAIL_QUEUE;

export async function publishEmailJob(job: EmailJob) {
  const channel = await getChannel();

  const buffer = Buffer.from(JSON.stringify(job));

  channel.sendToQueue(QUEUE, buffer, {
    persistent: true,
  });
}

export async function startWorker() {
  const channel = await getChannel();

  // control concurrency
  channel.prefetch(5);

  log.info("Email worker started...");

  channel.consume(
    QUEUE,
    async (msg) => {
      if (!msg) return;

      try {
        const job: EmailJob = JSON.parse(msg.content.toString());

        await sendMail(job);

        channel.ack(msg);

        log.info("Email sent: " + job.to);
      } catch (err) {
        log.error("Email sending failed: " + err);

        // retry
        channel.nack(msg, false, true);
      }
    },
    { noAck: false },
  );
}
