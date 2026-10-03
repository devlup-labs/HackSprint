import mongoose from "mongoose";
import { env } from "./env.js";
import { logger } from "../utils/logger.js";
import dotenv from "dotenv"
dotenv.config()

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);

    logger.info(
      {
        service: process.env.SERVICE_NAME,
      },
      "MongoDB connected successfully"
    );
  } catch (error) {
    logger.error(
      {
        service: process.env.SERVICE_NAME,
        err: error,
      },
      "MongoDB connection failed"
    );

    process.exit(1);
  }
};
