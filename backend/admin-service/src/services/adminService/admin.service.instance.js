import { logger } from "../../utils/logger.js";
import { adminRepository } from "../../repositories/admin.repository.instance.js";
import { AdminService } from "./admin.service.js";
import { NotificationClient } from "../../clients/notification.client.js";

const notificationClient = new NotificationClient(logger);

export const adminService =
  new AdminService(
    adminRepository,
    logger,
    notificationClient
  );