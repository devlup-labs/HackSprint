import { JudgeAssignmentRepository } from "./repositories/judgeAssignment.repository.js";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import multer from "multer";
import { connectDB } from "./config/db.js";
import { connectRedis, redisClient } from "./config/redis.js";
import hackathonRoutes from "./routes/hackathon.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import discussionRoutes from "./routes/discussion.routes.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import { logger } from "./utils/logger.js";
import { requestIdMiddleware } from "./middlewares/requestId.middleware.js";
import { metricsMiddleware, metricsHandler } from "./metrics/metrics.js";
import { startPhaseReminderJob } from "./jobs/phaseReminder.job.js";
import { startMatchReminderJob } from "./jobs/matchReminder.job.js";
import { initSentry, Sentry } from "./config/sentry.js";

dotenv.config();
initSentry();

const app = express();

app.set("trust proxy", 1);

const allowedOrigins = [
  process.env.FRONTEND_URL,
  "https://hacksprint.devluplabs.tech",
  "http://localhost:5173",
].filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(helmet());
app.use(compression());
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
app.use(metricsMiddleware);
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(requestIdMiddleware);

app.get("/metrics", metricsHandler);
app.get("/health", async (req, res) => {
  const mongo = mongoose.connection.readyState === 1;

  const redis = redisClient?.isOpen || false;

  return res.status(200).json({
    success: true,
    service: "hackathon-service",
    uptime: process.uptime(),
    mongo,
    redis,
    timestamp: new Date(),
  });
});

app.use("/", hackathonRoutes);
app.use("/api/discussions", discussionRoutes);
app.use("/platform/admin", adminRoutes);

app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  next(error);
});

app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDB();

    await new JudgeAssignmentRepository().backfillAcceptedStatus();

    await connectRedis();

    const server = app.listen(process.env.PORT, () => {
      logger.info(`Event service running on port ${process.env.PORT}`);
    });

    startPhaseReminderJob();
    startMatchReminderJob();

    const shutdown = async (signal) => {
      logger.info(`${signal} received. Starting graceful shutdown`);

      try {
        server.close(async () => {
          logger.info("HTTP server closed");

          if (redisClient?.isOpen) {
            await redisClient.quit();

            logger.info("Redis disconnected");
          }

          await mongoose.connection.close();

          logger.info("MongoDB disconnected");

          process.exit(0);
        });
      } catch (error) {
        logger.error({ err: error }, "Shutdown failed");

        process.exit(1);
      }
    };

    process.on("SIGINT", () => shutdown("SIGINT"));

    process.on("SIGTERM", () => shutdown("SIGTERM"));

    process.on("uncaughtException", (error) => {
      logger.fatal({ err: error }, "Uncaught Exception");
      Sentry.captureException(error);

      shutdown("UNCAUGHT_EXCEPTION");
    });

    process.on("unhandledRejection", (reason) => {
      logger.fatal({ reason }, "Unhandled Rejection");
      Sentry.captureException(reason);

      shutdown("UNHANDLED_REJECTION");
    });
  } catch (error) {
    logger.fatal({ err: error }, "Failed to start server");

    process.exit(1);
  }
};

startServer();
