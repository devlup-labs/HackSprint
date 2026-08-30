import dotenv from "dotenv";

dotenv.config();

export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: process.env.PORT || 5000,
  FRONTEND_URL: process.env.FRONTEND_URL,

  AUTH_SERVICE_URL: process.env.AUTH_SERVICE_URL,
  HACKATHON_SERVICE_URL: process.env.HACKATHON_SERVICE_URL,
  MEDIA_SERVICE_URL: process.env.MEDIA_SERVICE_URL,
  NOTIFICATION_SERVICE_URL: process.env.NOTIFICATION_SERVICE_URL,
  CHATBOT_SERVICE_URL: process.env.CHATBOT_SERVICE_URL
};
