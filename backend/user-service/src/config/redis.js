import { createClient } from "redis";
import { logger } from "../utils/logger.js";

export const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://redis:6379",
});

redisClient.on("connect", () => {
  logger.info("Redis connected");
});

redisClient.on("error", (err) => {
  logger.error({ err }, "Redis error");
});

export const connectRedis = async () => {
  await redisClient.connect();
};



