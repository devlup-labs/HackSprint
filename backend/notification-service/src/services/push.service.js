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
  async sendToUser(userId, { notificationId, title, message, actionUrl }) {
    const subscriptions = await this.pushSubscriptionRepository.findByUser(userId);
    if (!subscriptions.length) return;

    const payload = JSON.stringify({
      title,
      body: message,
      url: actionUrl || "/",
      // Same tag on a retry replaces the earlier copy instead of stacking.
      tag: notificationId || undefined,
    });

    let transientFailure = null;

    await Promise.all(
      subscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification(
            { endpoint: sub.endpoint, keys: sub.keys },
            payload,
            // Keep trying for a day if the device is offline, and ask the push
            // service to deliver promptly rather than batching it.
            { TTL: 60 * 60 * 24, urgency: "high" }
          );
        } catch (error) {
          if (error.statusCode === 404 || error.statusCode === 410) {
            await this.pushSubscriptionRepository.deleteByEndpoint(sub.endpoint);
            this.logger.info(
              { userId, endpoint: sub.endpoint },
              "Removed expired push subscription"
            );
          } else {
            transientFailure = error;
            this.logger.error(
              { err: error, userId, endpoint: sub.endpoint },
              "Failed to send push notification"
            );
          }
        }
      })
    );

    // A temporary failure (network, push-service 5xx, rate limit) has to fail
    // the job so the queue retries it — swallowing it would silently drop the
    // Chrome notification even though the in-app one exists.
    if (transientFailure) throw transientFailure;
  }
}
