import { BadRequestError } from "../../errors/BadRequestError.js";
import { NotFoundError } from "../../errors/NotFoundError.js";
import { ConflictError } from "../../errors/ConflictError.js";
import { ForbiddenError } from "../../errors/ForbiddenError.js";

export class ConnectionService {
  constructor(
    profileRepository,
    contactRequestRepository,
    directMessageRepository,
    notificationClient
  ) {
    this.profileRepository = profileRepository;
    this.contactRequestRepository = contactRequestRepository;
    this.directMessageRepository = directMessageRepository;
    this.notificationClient = notificationClient;
  }

  // The unique index on (sender, recipient) is the real one-request-per-pair
  // guarantee; this check just turns the raw duplicate-key error into a
  // clean one and covers the case where a prior request was declined (still
  // blocked — declining is meant to be permanent, same guarantee the old
  // one-shot ContactRequest gave).
  async sendRequest(senderId, recipientId, message) {
    if (!message?.trim()) {
      throw new BadRequestError("Message is required");
    }

    const recipient = await this.profileRepository.getByIdPublic(recipientId);

    if (!recipient) {
      throw new NotFoundError("User not found");
    }

    if (recipient._id.toString() === senderId.toString()) {
      throw new BadRequestError("You can't message yourself");
    }

    const alreadyRequested = await this.contactRequestRepository.exists(
      senderId,
      recipient._id
    );

    if (alreadyRequested) {
      throw new ConflictError("You've already reached out to this person");
    }

    const sender = await this.profileRepository.getById(senderId);

    let request;
    try {
      request = await this.contactRequestRepository.create(
        senderId,
        recipient._id,
        message.trim()
      );
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictError("You've already reached out to this person");
      }
      throw error;
    }

    await this.notificationClient.createNotification({
      userId: recipient._id,
      title: `${sender.name} wants to connect`,
      message: message.trim(),
      type: "SYSTEM",
      actionUrl: sender.userName ? `/u/${sender.userName}` : "",
      metadata: { connectionId: request._id.toString(), senderId: senderId.toString() },
    });

    return { success: true };
  }

  // Reply = accept: the recipient's first reply both flips the request to
  // "accepted" and becomes the opening DirectMessage — there's no separate
  // bare "accept with no message" action.
  async acceptRequest(connectionId, recipientId, replyMessage) {
    if (!replyMessage?.trim()) {
      throw new BadRequestError("A reply is required to accept");
    }

    const request = await this.contactRequestRepository.findById(connectionId);

    if (!request) {
      throw new NotFoundError("Connection request not found");
    }

    if (request.recipient.toString() !== recipientId.toString()) {
      throw new ForbiddenError("This request isn't addressed to you");
    }

    if (request.status !== "pending") {
      throw new ConflictError("This request has already been resolved");
    }

    // Create the message before flipping status — if this failed after the
    // status update instead, a retry would hit "already resolved" while no
    // message actually exists yet.
    const { message } = await this.directMessageRepository.create(
      recipientId,
      request.sender,
      replyMessage.trim()
    );

    await this.contactRequestRepository.updateStatus(connectionId, "accepted");

    const recipientProfile = await this.profileRepository.getByIdPublic(recipientId);

    await this.notificationClient.createNotification({
      userId: request.sender,
      title: `${recipientProfile.name} accepted your connection`,
      message: replyMessage.trim(),
      type: "SYSTEM",
      actionUrl: recipientProfile.userName ? `/u/${recipientProfile.userName}` : "",
      metadata: { friendId: recipientId.toString() },
    });

    return { success: true, message };
  }

  async declineRequest(connectionId, recipientId) {
    const request = await this.contactRequestRepository.findById(connectionId);

    if (!request) {
      throw new NotFoundError("Connection request not found");
    }

    if (request.recipient.toString() !== recipientId.toString()) {
      throw new ForbiddenError("This request isn't addressed to you");
    }

    if (request.status !== "pending") {
      throw new ConflictError("This request has already been resolved");
    }

    await this.contactRequestRepository.updateStatus(connectionId, "declined");

    return { success: true };
  }

  async getStatuses(userId, rawIds) {
    const ids = [...new Set(String(rawIds || "").split(",").map((x) => x.trim()))]
      .filter((x) => /^[a-f0-9]{24}$/i.test(x))
      .slice(0, 50);
    if (ids.length === 0) return {};
    const rows = await this.contactRequestRepository.findStatuses(ids, userId);
    return Object.fromEntries(rows.map((r) => [String(r._id), r.status]));
  }

  async listFriends(userId) {
    const connections = await this.contactRequestRepository.listConnections(
      userId,
      "accepted"
    );

    const friends = await Promise.all(
      connections.map(async (c) => {
        const friend =
          c.sender._id.toString() === userId.toString() ? c.recipient : c.sender;

        const lastMessage = await this.directMessageRepository.getLastMessage(
          userId,
          friend._id
        );

        return {
          connectionId: c._id,
          friend,
          lastMessage: lastMessage
            ? {
                content: lastMessage.content,
                createdAt: lastMessage.createdAt,
                sender: lastMessage.sender,
              }
            : null,
          connectedAt: c.updatedAt,
        };
      })
    );

    return friends;
  }
}
