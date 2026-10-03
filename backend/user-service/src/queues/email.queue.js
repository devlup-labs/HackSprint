import { Queue } from "bullmq";
import { env } from "../config/env.js";

if (!env.REDIS_URL) {
  throw new Error("REDIS_URL is missing");
}

export const emailQueue = new Queue("email", {
  connection: {
    url: env.REDIS_URL,
  },

  defaultJobOptions: {
    attempts: 5,

    backoff: {
      type: "exponential",
      delay: 5000,
    },

    removeOnComplete: 100,
    removeOnFail: 500,
  },
});
