import cron from "node-cron";
import { prisma } from "../lib/prisma";
import { sendLicenseExpiryEmail } from "./email.service";
import { createModuleLogger } from "../utils/logger";

const log = createModuleLogger(import.meta.url);

/**
 * Finds all drivers whose license has expired (licenseExpiryDate < today)
 * and sends each of them an expiry notification email via the email queue.
 *
 * Runs every day at midnight (00:00) server time.
 */
async function notifyExpiredLicenses(): Promise<void> {
  log.info("[cron] Running license expiry check...");

  const now = new Date();
  // Normalize to start of today so we catch any license that expired before today
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  let expiredDrivers: Array<{
    id: string;
    licenseNumber: string;
    licenseExpiryDate: Date;
    user: { name: string; email: string };
  }>;

  try {
    expiredDrivers = await prisma.driver.findMany({
      where: {
        licenseExpiryDate: { lt: today },
      },
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
    });
  } catch (err) {
    log.error(`[cron] Failed to query expired drivers: ${err}`);
    return;
  }

  if (expiredDrivers.length === 0) {
    log.info("[cron] No expired licenses found.");
    return;
  }

  log.info(
    `[cron] Found ${expiredDrivers.length} driver(s) with expired licenses. Enqueuing emails...`,
  );

  const results = await Promise.allSettled(
    expiredDrivers.map((driver) =>
      sendLicenseExpiryEmail({
        driverName: driver.user.name,
        email: driver.user.email,
        licenseNumber: driver.licenseNumber,
        expiryDate: driver.licenseExpiryDate.toLocaleDateString("en-IN", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
      }),
    ),
  );

  const succeeded = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.filter((r) => r.status === "rejected").length;

  if (failed > 0) {
    const errors = results
      .filter((r): r is PromiseRejectedResult => r.status === "rejected")
      .map((r) => r.reason);
    log.error(
      `[cron] License expiry emails: ${succeeded} succeeded, ${failed} failed. Errors: ${errors.join(", ")}`,
    );
  } else {
    log.info(
      `[cron] License expiry emails: ${succeeded}/${expiredDrivers.length} enqueued successfully.`,
    );
  }
}

/**
 * Registers all application cron jobs.
 * Call this once during server startup.
 */
export function registerCronJobs(): void {
  // Run every day at midnight (00:00)
  cron.schedule(
    "0 0 * * *",
    async () => {
      try {
        await notifyExpiredLicenses();
      } catch (err) {
        log.error(`[cron] Unhandled error in license expiry job: ${err}`);
      }
    },
    {
      timezone: "UTC",
    },
  );

  log.info(
    "[cron] Registered: licenseExpiryNotifier — runs daily at 00:00 UTC",
  );
}
