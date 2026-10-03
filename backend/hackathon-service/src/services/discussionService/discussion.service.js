import mongoose from "mongoose";
import { BadRequestError } from "../../errors/BadRequestError.js";
import { NotFoundError } from "../../errors/NotFoundError.js";
import { ForbiddenError } from "../../errors/ForbiddenError.js";

export class DiscussionService {
  constructor(discussionRepository, hackathonRepository, logger) {
    this.discussionRepository = discussionRepository;

    this.hackathonRepository = hackathonRepository;

    this.logger = logger;
  }

  async createMessage({ userId, hackathonId, content, parentMessage }) {
    if (!mongoose.Types.ObjectId.isValid(hackathonId)) {
      throw new BadRequestError("Invalid event id");
    }

    const hackathon = await this.hackathonRepository.getById(hackathonId);

    if (!hackathon) {
      throw new NotFoundError("Event not found");
    }

    if (!content?.trim()) {
      throw new BadRequestError("Message cannot be empty");
    }

    return this.discussionRepository.create({
      hackathon: hackathonId,
      sender: userId,
      content: content.trim(),
      parentMessage: parentMessage || null,
    });
  }

  async getMessages({ hackathonId, page, limit }) {
    return this.discussionRepository.getHackathonMessages(
      hackathonId,
      page,
      limit
    );
  }

  async getReplies(messageId) {
    return this.discussionRepository.getReplies(messageId);
  }

  async deleteMessage({ messageId, userId }) {
    const message = await this.discussionRepository.findById(messageId);

    if (!message) {
      throw new NotFoundError("Message not found");
    }

    if (message.sender.toString() !== userId.toString()) {
      throw new ForbiddenError("Unauthorized");
    }

    return this.discussionRepository.softDelete(messageId);
  }
}
