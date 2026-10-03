import ContactEnquiryModel from "../models/contactEnquiry.model.js";

export class ContactEnquiryRepository {
  async create(data) {
    return ContactEnquiryModel.create(data);
  }

  async countRecentByEmail(email, since) {
    return ContactEnquiryModel.countDocuments({ email, createdAt: { $gte: since } });
  }

  async list({ type, status, skip, limit }) {
    const filter = {};
    if (type) filter.type = type;
    if (status) filter.status = status;
    const [items, total, newCount] = await Promise.all([
      ContactEnquiryModel.find(filter)
        .populate("handledBy", "adminName")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ContactEnquiryModel.countDocuments(filter),
      ContactEnquiryModel.countDocuments({ status: "NEW" }),
    ]);
    return { items, total, newCount };
  }

  async update(id, data) {
    return ContactEnquiryModel.findByIdAndUpdate(id, data, { new: true })
      .populate("handledBy", "adminName")
      .lean();
  }
}
