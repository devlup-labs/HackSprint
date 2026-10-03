import { BadRequestError } from "../../errors/BadRequestError.js";
import { ForbiddenError } from "../../errors/ForbiddenError.js";

const CLIENT_ID_PATTERN = /^[A-Za-z0-9_-]{8,64}$/;

export class MessageService {
  constructor(contactRequestRepository, directMessageRepository) {
    this.contactRequestRepository = contactRequestRepository;
    this.directMessageRepository = directMessageRepository;
  }

  async assertFriends(userId, friendId) {
    const connection = await this.contactRequestRepository.findAcceptedBetween(
      userId,
      friendId
    );

    if (!connection) {
      throw new ForbiddenError("You're not connected with this person");
    }
  }

  async sendMessage(senderId, friendId, content, clientId) {
    if (!content?.trim()) {
      throw new BadRequestError("Message is required");
    }

    if (clientId !== undefined && !CLIENT_ID_PATTERN.test(String(clientId))) {
      throw new BadRequestError("Invalid message id");
    }

    await this.assertFriends(senderId, friendId);

    return this.directMessageRepository.create(
      senderId,
      friendId,
      content.trim(),
      clientId === undefined ? undefined : String(clientId)
    );
  }

  async listMessages(userId, friendId, page = 1, limit = 50) {
    await this.assertFriends(userId, friendId);

    return this.directMessageRepository.listMessages(userId, friendId, page, limit);
  }
}
