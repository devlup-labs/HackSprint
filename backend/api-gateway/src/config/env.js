import dotenv from "dotenv";

dotenv.config();

export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: process.env.PORT || 5000,
  FRONTEND_URL: process.env.FRONTEND_URL,

  // Token check at the gateway. Without both, the gateway just proxies and
  // each service keeps verifying tokens itself.
  SECRET_KEY: process.env.SECRET_KEY,
  INTERNAL_SERVICE_SECRET: process.env.INTERNAL_SERVICE_SECRET,

  // Shared rate-limit counters. Unset = per-process memory counters.
  REDIS_URL: process.env.REDIS_URL,

  // AUTH_SERVICE_URL is the old name for the same service; still honoured.
  USER_SERVICE_URL: process.env.USER_SERVICE_URL || process.env.AUTH_SERVICE_URL,
  HACKATHON_SERVICE_URL: process.env.HACKATHON_SERVICE_URL,
  ADMIN_SERVICE_URL: process.env.ADMIN_SERVICE_URL || "http://localhost:5006",
  MEDIA_SERVICE_URL: process.env.MEDIA_SERVICE_URL,
  NOTIFICATION_SERVICE_URL: process.env.NOTIFICATION_SERVICE_URL,
  CHATBOT_SERVICE_URL: process.env.CHATBOT_SERVICE_URL
};
