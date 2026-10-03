import mongoose from "mongoose";
import { BadRequestError } from "../../errors/BadRequestError.js";
import { ForbiddenError } from "../../errors/ForbiddenError.js";
import { NotFoundError } from "../../errors/NotFoundError.js";

const TYPES = ["PARTICIPATE", "ORGANISE", "PARTNER", "OTHER", "FEEDBACK"];
const CONTACT_TYPES = TYPES.filter((t) => t !== "FEEDBACK");
const ABOUT = ["Events", "Community", "Registration & teams", "Judging & results", "Design & ease of use", "Something else"];
const STATUSES = ["NEW", "IN_PROGRESS", "RESOLVED"];
const TYPE_LABEL = { PARTICIPATE: "wants to participate", ORGANISE: "wants to organise an event", PARTNER: "wants to partner", OTHER: "sent a message", FEEDBACK: "left feedback" };
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE = /^\+?[0-9]{10,15}$/;

const str = (v, max) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export class ContactService {
  constructor(contactRepository, adminRepository, notificationClient, logger) {
    this.contactRepository = contactRepository;
    this.adminRepository = adminRepository;
    this.notificationClient = notificationClient;
    this.logger = logger;
  }

  async submit(payload = {}, userId = null) {
    // A hidden "website" field no human fills in: bots that do get a quiet 200.
    if (str(payload.website, 50)) return { success: true };

    const type = str(payload.type, 20).toUpperCase() || "OTHER";
    if (!CONTACT_TYPES.includes(type)) throw new BadRequestError("Choose what you're getting in touch about");

    const name = str(payload.name, 100);
    const email = str(payload.email, 160).toLowerCase();
    const phone = str(payload.phone, 20).replace(/[\s-]/g, "");
    const message = str(payload.message, 3000);
    const organization = str(payload.organization, 160);

    if (name.length < 2) throw new BadRequestError("Your name is required");
    if (!EMAIL.test(email)) throw new BadRequestError("Enter a valid email address");
    if (phone && !PHONE.test(phone)) throw new BadRequestError("Enter a valid phone number or leave it blank");
    if (message.length < 20) throw new BadRequestError("Tell us a little more (at least 20 characters)");
    if (type === "ORGANISE" && organization.length < 2) throw new BadRequestError("Tell us which organisation or college you're organising for");

    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    if ((await this.contactRepository.countRecentByEmail(email, since)) >= 5) {
      throw new BadRequestError("We already have several messages from this email today. We'll reply soon.");
    }

    const participants = Number(payload.expectedParticipants);
    const enquiry = await this.contactRepository.create({
      type,
      name,
      email,
      phone,
      organization,
      role: str(payload.role, 100),
      eventName: str(payload.eventName, 160),
      expectedParticipants: Number.isFinite(participants) && participants > 0 ? Math.floor(participants) : null,
      preferredTimeline: str(payload.preferredTimeline, 100),
      message,
      userId: userId && mongoose.Types.ObjectId.isValid(userId) ? userId : null,
    });

    const controllers = await this.adminRepository.getControllers();
    await Promise.all(
      controllers.map((c) =>
        this.notificationClient.createNotification({
          userId: c._id,
          title: type === "ORGANISE" ? "New organiser enquiry" : "New enquiry",
          message: `${name}${organization ? ` (${organization})` : ""} ${TYPE_LABEL[type]}.`,
          type: "SYSTEM",
          actionUrl: "/admin",
        })
      )
    );

    this.logger.info({ enquiryId: enquiry._id, type }, "Contact enquiry received");
    return { success: true };
  }

  // The footer-only feedback form: a rating, what it's about and a few words.
  // Name and email are optional, so people can be honest without being known.
  async submitFeedback(payload = {}, userId = null) {
    if (str(payload.website, 50)) return { success: true };

    const rating = Number(payload.rating);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) throw new BadRequestError("Pick a rating from 1 to 5");

    const about = str(payload.about, 60);
    if (about && !ABOUT.includes(about)) throw new BadRequestError("Pick one of the topics");

    const message = str(payload.message, 3000);
    if (message.length < 10) throw new BadRequestError("A few words please (at least 10 characters)");

    const email = str(payload.email, 160).toLowerCase();
    if (email && !EMAIL.test(email)) throw new BadRequestError("Enter a valid email or leave it blank");

    const name = str(payload.name, 100) || "Anonymous";
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    if (email && (await this.contactRepository.countRecentByEmail(email, since)) >= 5) {
      throw new BadRequestError("Thanks, we already have several notes from you today.");
    }

    const enquiry = await this.contactRepository.create({
      type: "FEEDBACK",
      name,
      email,
      message,
      rating,
      feedbackAbout: about,
      userId: userId && mongoose.Types.ObjectId.isValid(userId) ? userId : null,
    });

    const controllers = await this.adminRepository.getControllers();
    await Promise.all(
      controllers.map((c) =>
        this.notificationClient.createNotification({
          userId: c._id,
          title: `New feedback · ${rating}/5`,
          message: `${name} ${about ? `on ${about.toLowerCase()}: ` : ": "}${message.slice(0, 90)}${message.length > 90 ? "…" : ""}`,
          type: "SYSTEM",
          actionUrl: "/admin",
        })
      )
    );

    this.logger.info({ enquiryId: enquiry._id, rating }, "Feedback received");
    return { success: true };
  }

  async ensureController(adminId) {
    const admin = await this.adminRepository.getById(adminId);
    if (!admin || !admin.controller) throw new ForbiddenError("Unauthorized");
  }

  async list(adminId, query = {}) {
    await this.ensureController(adminId);
    const type = TYPES.includes(String(query.type).toUpperCase()) ? String(query.type).toUpperCase() : "";
    const status = STATUSES.includes(String(query.status).toUpperCase()) ? String(query.status).toUpperCase() : "";
    const limit = Math.min(Math.max(parseInt(query.limit, 10) || 20, 1), 50);
    const page = Math.max(parseInt(query.page, 10) || 1, 1);
    const { items, total, newCount } = await this.contactRepository.list({ type, status, skip: (page - 1) * limit, limit });
    return { enquiries: items, total, newCount, pagination: { page, limit, hasNext: page * limit < total } };
  }

  async update(adminId, id, { status, internalNote } = {}) {
    await this.ensureController(adminId);
    if (!mongoose.Types.ObjectId.isValid(id)) throw new BadRequestError("Invalid enquiry id");
    const data = {};
    if (status !== undefined) {
      if (!STATUSES.includes(status)) throw new BadRequestError("Invalid status");
      data.status = status;
      data.handledBy = status === "NEW" ? null : adminId;
      data.handledAt = status === "NEW" ? null : new Date();
    }
    if (internalNote !== undefined) data.internalNote = str(internalNote, 1000);
    const updated = await this.contactRepository.update(id, data);
    if (!updated) throw new NotFoundError("Enquiry not found");
    return updated;
  }
}
