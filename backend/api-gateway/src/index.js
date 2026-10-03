import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import { env } from "./config/env.js";
import { userProxy } from "./routes/user.proxy.js";
import { hackathonProxy } from "./routes/hackathon.proxy.js";
import { adminProxy } from "./routes/admin.proxy.js";
import { gatewayIdentity } from "./middlewares/identity.middleware.js";
import { createLimiters } from "./middlewares/rateLimit.middleware.js";
import { connectRedis } from "./config/redis.js";
import { mediaProxy } from "./routes/media.proxy.js";
import { notificationProxy } from "./routes/notification.proxy.js";
import { chatbotProxy } from "./routes/chatbot.proxy.js";
import { notFound } from "./middlewares/notFound.middleware.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import { requestIdMiddleware } from "./middlewares/requestId.middleware.js";
import { metricsHandler, metricsMiddleware } from "./metrics/metrics.js";
import dotenv from "dotenv"
import { initSentry, Sentry } from "./config/sentry.js";
dotenv.config();
initSentry();

const app = express();

app.disable("x-powered-by");
app.set("trust proxy", 1);

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

const allowedOrigins = [
  env.FRONTEND_URL,
  "https://hacksprint.devluplabs.tech",
  "http://localhost:5173",
].filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(compression());
app.use(metricsMiddleware);
app.use(requestIdMiddleware);
app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));

await connectRedis();
const { ipLimiter, userLimiter, mediaLimiter } = createLimiters();

app.use(gatewayIdentity);
app.use(ipLimiter);
app.use(userLimiter);
app.get("/metrics", metricsHandler);
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    service: "api-gateway",
    status: "healthy",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    service: "api-gateway",
    message: "HackSprint API Gateway running",
  });
});
app.get("/ping-auth", async (req, res) => {
  try {
    const response = await fetch(`${env.USER_SERVICE_URL}/`);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.use("/api/auth", userProxy);
app.use("/api/hackathons", hackathonProxy);
app.use("/api/admin", adminProxy);
app.use("/api/media", mediaLimiter, mediaProxy);
app.use("/api/notifications", notificationProxy);
app.use("/api/chatbot", chatbotProxy);

app.use(notFound);
app.use(errorMiddleware);

const server = app.listen(env.PORT, () => {
  console.log(`API Gateway running on port ${env.PORT}`);
});

const shutdown = (signal) => {
  console.log(`${signal} received. Closing API Gateway...`);

  server.close(() => {
    console.log("API Gateway closed successfully");
    process.exit(0);
  });

  setTimeout(() => {
    console.error("Force closing API Gateway");
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
  Sentry.captureException(err);
  shutdown("unhandledRejection");
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  Sentry.captureException(err);
  shutdown("uncaughtException");
});
