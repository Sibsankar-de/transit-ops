declare namespace NodeJS {
  interface ProcessEnv {
    PORT: string;
    CORS_ORIGIN: string;
    NODE_ENV: string;
    APP_DEBUG: string;
  }
}
