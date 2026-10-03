import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import { env } from "./config/env.js";
import { connectDB } from "./config/db.js";
import { connectRedis, redisClient } from "./config/redis.js";
import authRoutes from "./routes/auth.routes.js";
import { logger } from "./utils/logger.js";
import profileRoutes from "./routes/profile.routes.js";
import connectionRoutes from "./routes/connection.routes.js";
import messageRoutes from "./routes/message.routes.js";
import skillRoutes from "./routes/skill.routes.js";
import dailyRoutes from "./routes/daily.routes.js";
import { dailyService } from "./services/dailyService/daily.service.instance.js";
import { skillService } from "./services/skillService/skill.service.instance.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import { requestIdMiddleware } from "./middlewares/requestId.middleware.js";
import { metricsHandler, metricsMiddleware } from "./metrics/metrics.js";
import dotenv from "dotenv";
import { initSentry, Sentry } from "./config/sentry.js";
dotenv.config();
initSentry();

const app = express();

app.set("trust proxy", 1);

app.use(helmet());

app.use(compression());

const allowedOrigins = [
  env.FRONTEND_URL,
  "https://hacksprint.devluplabs.tech",
  "http://localhost:5173",
].filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());
app.use(metricsMiddleware)
app.use(requestIdMiddleware);
app.use((req, res, next) => {
  try {
    logger.info(
      {
        method: req.method,
        url: req.originalUrl,
        requestId: req.requestId,
      },
      "Incoming Request"
    );
  } catch (err) {
    console.error("Logger failed", err);
  }

  next();
});
app.get("/metrics", metricsHandler);
app.get("/health", (req, res) => {
  return res.json({
    success: true,
    service: "user-service",
    message: "User Service running",
  });
});

app.use("/", authRoutes);
app.use("/profile",profileRoutes);
app.use("/connections", connectionRoutes);
app.use("/messages", messageRoutes);
app.use("/skills", skillRoutes);
app.use("/daily", dailyRoutes);

app.use(errorHandler);

await connectDB();
await connectRedis();
await skillService.ensureSeeded();
await dailyService.ensureSeeded();

const server = app.listen(env.PORT, () => {
  logger.info(`User service running on port ${env.PORT}`);
});

const shutdown = async (signal) => {
  logger.info(
    `${signal} received. Starting graceful shutdown`
  );

  try {
    await new Promise((resolve) =>
      server.close(resolve)
    );

    logger.info("HTTP server closed");

    await redisClient.quit();

    logger.info("Redis connection closed");

    await mongoose.connection.close();

    logger.info("MongoDB connection closed");

    logger.info(
      "Graceful shutdown completed"
    );

    process.exit(0);
  } catch (error) {
    logger.error(
      { err: error },
      "Graceful shutdown failed"
    );

    process.exit(1);
  }
};

process.on("SIGINT", () => {
  shutdown("SIGINT");
});

process.on("SIGTERM", () => {
  shutdown("SIGTERM");
});

process.on("uncaughtException", (error) => {
  logger.fatal(
    { err: error },
    "Uncaught Exception"
  );
  Sentry.captureException(error);

  shutdown("UNCAUGHT_EXCEPTION");
});

process.on("unhandledRejection", (reason) => {
  logger.fatal(
    { reason },
    "Unhandled Rejection"
  );
  Sentry.captureException(reason);

  shutdown("UNHANDLED_REJECTION");
});