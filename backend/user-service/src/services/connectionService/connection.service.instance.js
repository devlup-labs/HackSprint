import { ConnectionService } from "./connection.service.js";
import { profileRepository } from "../../repositories/profile.repository.instance.js";
import { ContactRequestRepository } from "../../repositories/contactRequest.repository.js";
import { DirectMessageRepository } from "../../repositories/directMessage.repository.js";
import { NotificationClient } from "../../clients/notification.client.js";
import { logger } from "../../utils/logger.js";

const contactRequestRepository = new ContactRequestRepository();
const directMessageRepository = new DirectMessageRepository();
const notificationClient = new NotificationClient(logger);

export const connectionService = new ConnectionService(
  profileRepository,
  contactRequestRepository,
  directMessageRepository,
  notificationClient
);
