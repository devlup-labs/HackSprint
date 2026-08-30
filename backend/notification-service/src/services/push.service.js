import webpush from "web-push";
import { env } from "../config/env.js";
import { BadRequestError } from "../errors/BadRequestError.js";

webpush.setVapidDetails(env.VAPID_SUBJECT, env.VAPID_PUBLIC_KEY, env.VAPID_PRIVATE_KEY);

export class PushService {
  constructor(pushSubscriptionRepository, logger) {
    this.pushSubscriptionRepository = pushSubscriptionRepository;
    this.logger = logger;
  }

  getPublicKey() {
    return env.VAPID_PUBLIC_KEY;
  }

  async subscribe(userId, subscription, userAgent) {
    if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
      throw new BadRequestError("Invalid push subscription");
    }

    return this.pushSubscriptionRepository.upsert(userId, subscription, userAgent);
  }

  async unsubscribe(endpoint) {
    if (!endpoint) return { success: true };
    await this.pushSubscriptionRepository.deleteByEndpoint(endpoint);
    return { success: true };
  }

  // Fans a single notification out to every browser/device the user has
  // subscribed from. Best-effort per subscription — one dead endpoint
  // (uninstalled browser, revoked permission) must never block delivery to
  // the user's other devices.
  async sendToUser(userId, { title, message, actionUrl }) {
    const subscriptions = await this.pushSubscriptionRepository.findByUser(userId);
    if (!subscriptions.length) return;

    const payload = JSON.stringify({
      title,
      body: message,
      url: actionUrl || "/",
    });

    await Promise.all(
      subscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification(
            { endpoint: sub.endpoint, keys: sub.keys },
            payload
          );
        } catch (error) {
          if (error.statusCode === 404 || error.statusCode === 410) {
            await this.pushSubscriptionRepository.deleteByEndpoint(sub.endpoint);
            this.logger.info(
              { userId, endpoint: sub.endpoint },
              "Removed expired push subscription"
            );
          } else {
            this.logger.error(
              { err: error, userId, endpoint: sub.endpoint },
              "Failed to send push notification"
            );
          }
        }
      })
    );
  }
}
