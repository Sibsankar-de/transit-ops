declare namespace NodeJS {
  interface ProcessEnv {
    PORT: string;
    CORS_ORIGIN: string;
    NODE_ENV: string;
    APP_DEBUG: string;
    COOKIE_DOMAIN: string;
    DATABASE_URL: string;
    ACCESS_TOKEN_SECRET: string;
    REFRESH_TOKEN_SECRET: string;
    ACCESS_TOKEN_EXPIRY: any;
    REFRESH_TOKEN_EXPIRY: any;
    ACCESS_TOKEN_COOKIE_EXPIRY: number;
    REFRESH_TOKEN_COOKIE_EXPIRY: number;
    SMTP_HOST: string;
    SMTP_PORT: string;
    SMTP_SECURE: string;
    SMTP_USER: string;
    SMTP_PASS: string;
    RABBITMQ_CONNECTION_URI: string;
    RABBITMQ_EMAIL_QUEUE: string;
  }
}
