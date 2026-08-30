import ContactRequestModel from "../models/contactRequest.models.js";

export class ContactRequestRepository {
  async create(sender, recipient, message) {
    return ContactRequestModel.create({ sender, recipient, message });
  }

  async exists(sender, recipient) {
    return ContactRequestModel.exists({ sender, recipient });
  }
}
