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
  COOKIE_DOMAIN: process.env.COOKIE_DOMAIN || "localhost",

  DATABASE_URL: process.env.DATABASE_URL || "",

  ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
  ACCESS_TOKEN_EXPIRY: process.env.ACCESS_TOKEN_EXPIRY,

  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
  REFRESH_TOKEN_EXPIRY: process.env.REFRESH_TOKEN_EXPIRY,

  ACCESS_TOKEN_COOKIE_EXPIRY: process.env.ACCESS_TOKEN_COOKIE_EXPIRY,
  REFRESH_TOKEN_COOKIE_EXPIRY: process.env.REFRESH_TOKEN_COOKIE_EXPIRY,
} as const;
