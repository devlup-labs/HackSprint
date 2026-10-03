import DirectMessageModel from "../models/directMessage.models.js";

const conversationKey = (userA, userB) =>
  [userA.toString(), userB.toString()].sort().join("_");

export class DirectMessageRepository {
  // Returns { message, created }. With a clientId, sending the same message
  // twice is safe: the unique (sender, clientId) index rejects the second
  // insert and the original is returned with created = false.
  async create(sender, recipient, content, clientId) {
    try {
      const message = await DirectMessageModel.create({
        sender,
        recipient,
        content,
        ...(clientId && { clientId }),
      });
      return { message, created: true };
    } catch (error) {
      if (error.code === 11000 && clientId) {
        const existing = await DirectMessageModel.findOne({ sender, clientId });
        if (existing) return { message: existing, created: false };
      }
      throw error;
    }
  }

  async listMessages(userA, userB, page = 1, limit = 50) {
    return DirectMessageModel.find({
      conversationKey: conversationKey(userA, userB),
      isDeleted: false,
    })
      .populate("sender", "name userName image")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();
  }

  async getLastMessage(userA, userB) {
    return DirectMessageModel.findOne({
      conversationKey: conversationKey(userA, userB),
      isDeleted: false,
    })
      .sort({ createdAt: -1 })
      .lean();
  }
}
