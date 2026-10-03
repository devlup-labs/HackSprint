import { logger } from "../../utils/logger.js";
import { adminRepository } from "../../repositories/admin.repository.instance.js";
import { AdminAuthService } from "./adminAuth.service.js";
import { NotificationClient } from "../../clients/notification.client.js";

const notificationClient = new NotificationClient(logger);

export const adminAuthService =
  new AdminAuthService(
    adminRepository,
    logger,
    notificationClient
  );