import mongoose from "mongoose";

// Messages from the public Contact page — anyone (signed in or not) can ask to
// take part in an event, host one, partner with HackSprint, or just get in
// touch. Controllers triage them from the admin dashboard.
const contactEnquirySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["PARTICIPATE", "ORGANISE", "PARTNER", "OTHER", "FEEDBACK"],
      required: true,
      index: true,
    },
    name: { type: String, trim: true, maxlength: 100, default: "Anonymous" },
    email: { type: String, trim: true, lowercase: true, maxlength: 160, default: "" },
    phone: { type: String, trim: true, maxlength: 20, default: "" },
    organization: { type: String, trim: true, maxlength: 160, default: "" },
    role: { type: String, trim: true, maxlength: 100, default: "" },
    eventName: { type: String, trim: true, maxlength: 160, default: "" },
    expectedParticipants: { type: Number, min: 0, max: 1000000, default: null },
    preferredTimeline: { type: String, trim: true, maxlength: 100, default: "" },
    message: { type: String, required: true, trim: true, maxlength: 3000 },
    // Feedback form only: 1–5 and what it is about.
    rating: { type: Number, min: 1, max: 5, default: null },
    feedbackAbout: { type: String, trim: true, maxlength: 60, default: "" },
    status: {
      type: String,
      enum: ["NEW", "IN_PROGRESS", "RESOLVED"],
      default: "NEW",
      index: true,
    },
    handledBy: { type: mongoose.Schema.Types.ObjectId, ref: "admins", default: null },
    handledAt: { type: Date, default: null },
    internalNote: { type: String, trim: true, maxlength: 1000, default: "" },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "users", default: null },
  },
  { timestamps: true }
);

contactEnquirySchema.index({ createdAt: -1 });

export default mongoose.model("contactEnquiries", contactEnquirySchema);
