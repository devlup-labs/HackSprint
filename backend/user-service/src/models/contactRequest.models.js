import mongoose from "mongoose";

// Outreach from the People directory becomes a connection request: the
// unique index on (sender, recipient) still enforces "only one request per
// profile" at the database level — but instead of dying there, a row now
// transitions pending -> accepted (recipient replied) or declined (recipient
// dismissed it without replying, which permanently blocks the sender from
// re-requesting the same recipient).
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
    status: {
      type: String,
      enum: ["pending", "accepted", "declined"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

contactRequestSchema.index({ sender: 1, recipient: 1 }, { unique: true });

const ContactRequestModel = mongoose.model("contactrequests", contactRequestSchema);

export default ContactRequestModel;
