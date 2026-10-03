import { logger } from "../../utils/logger.js";
import { adminRepository } from "../../repositories/admin.repository.instance.js";
import { ContactEnquiryRepository } from "../../repositories/contactEnquiry.repository.js";
import { NotificationClient } from "../../clients/notification.client.js";
import { ContactService } from "./contact.service.js";

export const contactService = new ContactService(
  new ContactEnquiryRepository(),
  adminRepository,
  new NotificationClient(logger),
  logger
);
