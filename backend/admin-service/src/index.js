import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import publicRoutes from "./routes/public.routes.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import { logger } from "./utils/logger.js";
import { requestIdMiddleware } from "./middlewares/requestId.middleware.js";
import { metricsMiddleware, metricsHandler } from "./metrics/metrics.js";

dotenv.config();

const app = express();

app.set("trust proxy", 1);

const allowedOrigins = [
  process.env.FRONTEND_URL,
  "https://hacksprint.devluplabs.tech",
  "http://localhost:5173",
].filter(Boolean);

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(helmet());
app.use(compression());
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use(metricsMiddleware);
app.use(morgan("dev"));
app.use(requestIdMiddleware);

app.get("/metrics", metricsHandler);
app.get("/health", (req, res) =>
  res.status(200).json({
    success: true,
    service: "admin-service",
    uptime: process.uptime(),
    mongo: mongoose.connection.readyState === 1,
    timestamp: new Date(),
  })
);

// The gateway strips its /api/admin prefix, so these are the paths the
// frontend reaches as /api/admin/auth/*, /api/admin/public/* and /api/admin/*.
app.use("/auth", authRoutes);
app.use("/public", publicRoutes);
app.use("/", adminRoutes);

app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDB();

    const server = app.listen(process.env.PORT, () => {
      logger.info(`Admin service running on port ${process.env.PORT}`);
    });

    const shutdown = async (signal) => {
      logger.info(`${signal} received. Starting graceful shutdown`);
      server.close(async () => {
        await mongoose.connection.close();
        logger.info("MongoDB disconnected");
        process.exit(0);
      });
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("uncaughtException", (error) => {
      logger.fatal({ err: error }, "Uncaught Exception");
      shutdown("UNCAUGHT_EXCEPTION");
    });
    process.on("unhandledRejection", (reason) => {
      logger.fatal({ reason }, "Unhandled Rejection");
      shutdown("UNHANDLED_REJECTION");
    });
  } catch (error) {
    logger.fatal({ err: error }, "Failed to start server");
    process.exit(1);
  }
};

startServer();
