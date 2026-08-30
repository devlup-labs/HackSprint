import mongoose from "mongoose";

// One-shot outreach from the People directory — deliberately not a chat
// thread. The unique index on (sender, recipient) is what actually enforces
// "only one message per profile" at the database level, not just in the
// service layer.
const contactRequestSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  }
);

contactRequestSchema.index({ sender: 1, recipient: 1 }, { unique: true });

const ContactRequestModel = mongoose.model("contactrequests", contactRequestSchema);

export default ContactRequestModel;
