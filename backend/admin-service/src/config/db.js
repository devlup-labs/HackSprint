import mongoose from "mongoose";
import {logger} from "../utils/logger.js";

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL, {
      autoIndex: process.env.NODE_ENV !== "production",
    });
    
    if (process.env.NODE_ENV !== "production") {
      mongoose.set("debug", (collectionName, method, query) => {
        console.log({
          collectionName,
          method,
          query,
        });
      });
    }

    logger.info("MongoDB connected successfully");
  } catch (error) {
    logger.fatal(
      {
        err: error,
      },
      "MongoDB connection failed"
    );

    process.exit(1);
  }
};
