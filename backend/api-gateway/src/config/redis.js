import { createClient } from "redis";
import { env } from "./env.js";

// Optional: only used for rate-limit counters, so a Redis outage must never
// take the gateway down. With no REDIS_URL the limiters use process memory.
export const redisClient = env.REDIS_URL ? createClient({ url: env.REDIS_URL }) : null;

export const connectRedis = async () => {
  if (!redisClient) {
    console.warn("[gateway] REDIS_URL not set — rate limits are per-process");
    return;
  }
  redisClient.on("error", (err) => console.error("[gateway] Redis error:", err.message));
  try {
    await redisClient.connect();
    console.log("[gateway] Redis connected — rate limits are shared");
  } catch (err) {
    console.error("[gateway] Redis unavailable, using per-process rate limits:", err.message);
  }
};
