import { app } from "./app";
import { env } from "./configs/env";
import { connectDb } from "./lib/prisma";
import { connectRabbit } from "./lib/rabbit";
import { seedDefaultAdmin } from "./service/user.service";
import { registerCronJobs } from "./service/cron.service";
import { createModuleLogger } from "./utils/logger";

const log = createModuleLogger(import.meta.url);

async function main() {
  await connectDb();
  try {
    await seedDefaultAdmin();
    log.info("Default admin user seeded/verified successfully");
  } catch (error) {
    log.error(`Failed to seed default admin: ${error}`);
  }
  await connectRabbit();

  // Register all cron jobs after DB and queue are ready
  registerCronJobs();

  const server = app.listen(env.PORT, () => {
    log.info(`Server is running at port ${env.PORT}`);
  });

  server?.on("error", (error: any) => {
    log.error(`Server error: ${error.message}`);
    throw error;
  });
}

main();
