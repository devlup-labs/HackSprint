import ContactRequestModel from "../models/contactRequest.models.js";

export class ContactRequestRepository {
  async create(sender, recipient, message) {
    return ContactRequestModel.create({ sender, recipient, message });
  }

  async exists(sender, recipient) {
    return ContactRequestModel.exists({ sender, recipient });
  }

  // Statuses for a batch of requests, limited to ones this user is part of.
  async findStatuses(ids, userId) {
    return ContactRequestModel.find({
      _id: { $in: ids },
      $or: [{ sender: userId }, { recipient: userId }],
    })
      .select("status")
      .lean();
  }

  async findById(id) {
    return ContactRequestModel.findById(id);
  }

  async updateStatus(id, status) {
    return ContactRequestModel.findByIdAndUpdate(id, { status }, { new: true });
  }

  // Symmetric — a connection is "accepted" regardless of which side
  // originally sent the request, so this is what actually gates DM access.
  async findAcceptedBetween(userA, userB) {
    return ContactRequestModel.findOne({
      status: "accepted",
      $or: [
        { sender: userA, recipient: userB },
        { sender: userB, recipient: userA },
      ],
    });
  }

  // The Friends list — every accepted request involving this user, with the
  // OTHER party populated so the caller never has to figure out which side
  // of sender/recipient they are.
  async listConnections(userId, status) {
    return ContactRequestModel.find({
      status,
      $or: [{ sender: userId }, { recipient: userId }],
    })
      .populate("sender", "name userName image")
      .populate("recipient", "name userName image")
      .sort({ updatedAt: -1 })
      .lean();
  }
}
