import { MessageService } from "./message.service.js";
import { ContactRequestRepository } from "../../repositories/contactRequest.repository.js";
import { DirectMessageRepository } from "../../repositories/directMessage.repository.js";

const contactRequestRepository = new ContactRequestRepository();
const directMessageRepository = new DirectMessageRepository();

export const messageService = new MessageService(
  contactRequestRepository,
  directMessageRepository
);
