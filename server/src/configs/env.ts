import dotenv from "dotenv";

dotenv.config({
  path: ".env",
});

const parseBoolean = (value: string | undefined): boolean => value === "true";

export const env = {
  CORS_ORIGIN: process.env.CORS_ORIGIN || "",
  PORT: process.env.PORT || "4000",
  NODE_ENV: process.env.NODE_ENV || "development",
  APP_DEBUG: parseBoolean(process.env.APP_DEBUG),
  DATABASE_URL: process.env.DATABASE_URL || "",
} as const;
