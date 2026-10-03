import { Worker } from "bullmq";
import { pushService } from "../services/push.service.instance.js";
import { logger } from "../utils/logger.js";
import { env } from "../config/env.js";
import { Sentry } from "../config/sentry.js";

export const pushWorker = new Worker(
  "push",
  async (job) => {
    const { userId, notificationId, title, message, actionUrl } = job.data;
    await pushService.sendToUser(userId, { notificationId, title, message, actionUrl });

    logger.info({ jobId: job.id, userId }, "Push job processed");
  },
  {
    connection: {
      host: env.REDIS_HOST,
      port: Number(env.REDIS_PORT),
    },

    concurrency: 10,
  }
);

pushWorker.on("failed", (job, err) => {
  logger.error(
    {
      jobId: job?.id,
      attemptsMade: job?.attemptsMade,
      userId: job?.data?.userId,
      err,
    },
    "Push job failed"
  );

  // Only report once retries are exhausted — BullMQ fires "failed" on every
  // attempt, and capturing each one would triple-report the same underlying
  // issue for a job with the default 3 attempts.
  if (job && job.attemptsMade >= (job.opts?.attempts || 1)) {
    Sentry.captureException(err);
  }
});

pushWorker.on("error", (err) => {
  logger.error({ err }, "Push worker error");
});
