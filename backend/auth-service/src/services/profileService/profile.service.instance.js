import { ProfileService } from "./profile.service.js";
import { profileRepository } from "../../repositories/profile.repository.instance.js";
import { logger } from "../../utils/logger.js";
import { MediaServiceClient } from "../mediaService/media.client.js";
import { ContactRequestRepository } from "../../repositories/contactRequest.repository.js";
import { NotificationClient } from "../../clients/notification.client.js";

const mediaServiceClient = new MediaServiceClient();

const contactRequestRepository = new ContactRequestRepository();

const notificationClient = new NotificationClient(logger);

export const profileService =
  new ProfileService(
    profileRepository,
    mediaServiceClient,
    logger,
    contactRequestRepository,
    notificationClient
  );