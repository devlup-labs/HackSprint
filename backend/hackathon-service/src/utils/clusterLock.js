import { redisClient } from "../config/redis.js";
import { logger } from "./logger.js";

// Runs `fn` on only one instance per tick when several copies of the service
// are running. The first instance to set the key wins; the rest skip. The key
// is left to expire on its own rather than released, so an instance whose
// clock ticks a few seconds late can't run the same sweep again.
//
// If Redis is unreachable the sweep still runs: a rare duplicate reminder is
// a better failure than reminders not going out at all.
export const runExclusive = async (name, ttlSeconds, fn) => {
  if (redisClient?.isOpen) {
    try {
      const acquired = await redisClient.set(`lock:${name}`, "1", { NX: true, EX: ttlSeconds });
      if (!acquired) {
        logger.debug({ job: name }, "Another instance is running this job, skipping");
        return;
      }
    } catch (err) {
      logger.warn({ err, job: name }, "Job lock unavailable, running anyway");
    }
  }
  await fn();
};
