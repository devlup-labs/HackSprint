import axios from "axios";

export class NotificationClient {
  constructor(logger) {
    this.logger = logger;
  }

  async createNotification({
    userId,
    title,
    message,
    type = "SYSTEM",
    actionUrl = "",
    metadata = {},
  }) {
    try {
      // Read at call time, not in the constructor — several call sites
      // (e.g. the cron job files) construct this before index.js's own
      // dotenv.config() has run, since ESM evaluates static imports before
      // the importing file's own top-level code. Snapshotting the URL in
      // the constructor would permanently freeze it as undefined for those.
      await axios.post(
        `${process.env.NOTIFICATION_SERVICE_URL}/internal`,
        {
          userId,
          title,
          message,
          type,
          actionUrl,
          metadata,
        },
        {
          headers: {
            "x-service-secret": process.env.INTERNAL_SERVICE_SECRET,
          },

          timeout: 5000,
        }
      );
    } catch (error) {
      console.log("Notification Error:");
      console.log(error);

      this.logger.error(
        {
          err: error,
          userId,
          title
        },
        "Failed to create notification"
      );
    }
  }

  // Fire-and-forget, same as createNotification — a failed email send
  // should never block or fail the caller's actual operation (approving a
  // hackathon, registering, submitting).
  async sendEmail({ type, user, token, hackathon }) {
    try {
      await axios.post(
        `${process.env.NOTIFICATION_SERVICE_URL}/internal/email`,
        { type, user, token, hackathon },
        {
          headers: {
            "x-service-secret": process.env.INTERNAL_SERVICE_SECRET,
          },
          timeout: 5000,
        }
      );
    } catch (error) {
      this.logger.error(
        { err: error, type, userEmail: user?.email },
        "Failed to queue email"
      );
    }
  }
}
