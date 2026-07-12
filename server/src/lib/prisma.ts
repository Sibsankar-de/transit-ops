import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { env } from "../configs/env.js";
import { createModuleLogger } from "../utils/logger.js";

const log = createModuleLogger(import.meta.url);

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const pool = new Pool({
    connectionString: env.DATABASE_URL,
  });

  const adapter = new PrismaPg(pool);

  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export async function connectDb(): Promise<void> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    log.info("Database connected successfully");
  } catch (error) {
    log.error(`Failed to connect to the database: ${error}`);
    process.exit(1);
  }
}
