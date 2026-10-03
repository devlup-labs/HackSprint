import { emailQueue } from "../queues/email.queue.js";
import { logger } from "../utils/logger.js";

export const addEmailJob = async (data) => {
  try {
    const job = await emailQueue.add("send-email", data);

    logger.info(
      {
        jobId: job.id,
        type: data.type,
      },
      "Email job queued"
    );

    return job;
  } catch (error) {
    logger.error(
      {
        err: error,
        type: data?.type,
      },
      "Failed to queue email job"
    );

    throw error;
  }
};
