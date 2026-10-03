import dotenv from "dotenv";

dotenv.config();

const requiredEnvVars = ["GEMINI_API_KEY", "FRONTEND_URL"];

requiredEnvVars.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
});

export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  SERVICE_NAME: process.env.SERVICE_NAME || "chatbot-service",
  PORT: process.env.PORT || 5005,

  FRONTEND_URL: process.env.FRONTEND_URL,

  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  // Kept overridable — Gemini model names/tiers change over time and the
  // right choice depends on the caller's own API plan/quota.
  GEMINI_MODEL: process.env.GEMINI_MODEL || "gemini-3.5-flash",
};
