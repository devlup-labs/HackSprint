import dotenv from "dotenv";

dotenv.config();

const requiredEnvVars = [
  "MONGO_URL",
  "SECRET_KEY",
  "FRONTEND_URL",
  "BREVO_API_KEY",
];

requiredEnvVars.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
});

export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  SERVICE_NAME: process.env.SERVICE_NAME || "user-service",

  PORT: process.env.PORT || 5001,
  MONGO_URL: process.env.MONGO_URL,
  REDIS_URL: process.env.REDIS_URL,
  REDIS_HOST: process.env.REDIS_HOST,
  REDIS_PORT: process.env.REDIS_PORT || 6379,

  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,

  GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,

  SECRET_KEY: process.env.SECRET_KEY,
  JWT_EXPIRE_TIME: process.env.JWT_EXPIRE_TIME || "7d",
  REFRESH_TOKEN_EXPIRE_TIME: process.env.REFRESH_TOKEN_EXPIRE_TIME || "30d",

  FRONTEND_URL: process.env.FRONTEND_URL,

  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  SENDER_EMAIL: process.env.SENDER_EMAIL,

  EMAIL: process.env.EMAIL,
  EMAIL_PASS: process.env.EMAIL_PASS,

  BREVO_API_KEY: process.env.BREVO_API_KEY,
  BREVO_SENDER_EMAIL: process.env.BREVO_SENDER_EMAIL,
};
