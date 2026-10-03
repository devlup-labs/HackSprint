import axios from "axios";

// Auth-service has never needed to reach notification-service before (its
// own transactional email goes through its own BullMQ queue) — this is
// the one new cross-service call, needed to deliver a People-directory
// contact request as an in-app + push notification.
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
      await axios.post(
        `${process.env.NOTIFICATION_SERVICE_URL}/internal`,
        { userId, title, message, type, actionUrl, metadata },
        {
          headers: { "x-service-secret": process.env.INTERNAL_SERVICE_SECRET },
          timeout: 5000,
        }
      );
    } catch (error) {
      this.logger.error(
        { err: error, userId, title },
        "Failed to create notification"
      );
    }
  }
}
