import mongoose from "mongoose";
import { BadRequestError } from "../errors/BadRequestError.js";
import { NotFoundError } from "../errors/NotFoundError.js";
import { pushQueue } from "../queues/push.queue.js";

export class NotificationService {
  constructor(
    notificationRepository,
    logger
  ) {
    this.notificationRepository =
      notificationRepository;

    this.logger = logger;
  }

  async createNotification(payload) {
    const {
      userId,
      title,
      message,
      type = "SYSTEM",
      actionUrl = "",
      metadata = {},
    } = payload;

    if (
      !mongoose.Types.ObjectId.isValid(
        userId
      )
    ) {
      throw new BadRequestError(
        "Invalid user id"
      );
    }

    if (!title?.trim()) {
      throw new BadRequestError(
        "Title is required"
      );
    }

    if (!message?.trim()) {
      throw new BadRequestError(
        "Message is required"
      );
    }

    const notification =
      await this.notificationRepository.create(
        {
          userId,
          title: title.trim(),
          message: message.trim(),
          type,
          actionUrl,
          metadata,
        }
      );

    this.logger.info(
      {
        notificationId:
          notification._id,
        userId,
        type,
      },
      "Notification created"
    );

    // Every notification also fans out as a browser push — queued (not
    // awaited) so a slow/unreachable push service never delays the caller,
    // and retried on transient failure like every other queued job here.
    pushQueue
      .add("send-push", {
        userId,
        notificationId: String(notification._id),
        title: notification.title,
        message: notification.message,
        actionUrl: notification.actionUrl,
      })
      .catch((error) => {
        this.logger.error(
          { err: error, userId, notificationId: notification._id },
          "Failed to queue push notification"
        );
      });

    return notification;
  }

  async getNotifications(
    userId,
    page = 1,
    limit = 20
  ) {
    page = Number(page);
    limit = Number(limit);

    if (page < 1) {
      page = 1;
    }

    if (limit > 50) {
      limit = 50;
    }

    return this.notificationRepository.findByUser(
      userId,
      page,
      limit
    );
  }

  async getUnreadCount(userId) {
    const count =
      await this.notificationRepository.getUnreadCount(
        userId
      );

    return {
      count,
    };
  }

  async markAsRead(
    notificationId,
    userId
  ) {
    if (
      !mongoose.Types.ObjectId.isValid(
        notificationId
      )
    ) {
      throw new BadRequestError(
        "Invalid notification id"
      );
    }

    const notification =
      await this.notificationRepository.markAsRead(
        notificationId,
        userId
      );

    if (!notification) {
      throw new NotFoundError(
        "Notification not found"
      );
    }

    return notification;
  }

  async markAllAsRead(userId) {
    await this.notificationRepository.markAllAsRead(
      userId
    );

    return {
      success: true,
    };
  }

  async deleteNotification(
    notificationId,
    userId
  ) {
    if (
      !mongoose.Types.ObjectId.isValid(
        notificationId
      )
    ) {
      throw new BadRequestError(
        "Invalid notification id"
      );
    }

    const notification =
      await this.notificationRepository.delete(
        notificationId,
        userId
      );

    if (!notification) {
      throw new NotFoundError(
        "Notification not found"
      );
    }

    return {
      success: true,
    };
  }

  async clearAllNotifications(userId) {
    await this.notificationRepository.deleteManyByUser(
      userId
    );

    return {
      success: true,
    };
  }
}