import mongoose from "mongoose";

// conversationKey is the two participant ids, sorted and joined — computed
// once on save so every message between a pair of users lands on the same
// key regardless of who's sender vs recipient in a given message, letting
// the whole thread be paginated off one simple indexed field.
const directMessageSchema = new mongoose.Schema(
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

    conversationKey: {
      type: String,
      required: true,
    },

    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },

    // Chosen by the sender's device. If a send times out after the server has
    // already saved it, the retry carries the same id and gets the original
    // message back instead of creating a duplicate.
    clientId: {
      type: String,
      maxlength: 64,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Mongoose 9 dropped callback-style (`next`) middleware entirely — a plain
// synchronous function is all that's needed here.
directMessageSchema.pre("validate", function computeConversationKey() {
  if (this.sender && this.recipient) {
    this.conversationKey = [this.sender.toString(), this.recipient.toString()]
      .sort()
      .join("_");
  }
});

directMessageSchema.index({ conversationKey: 1, createdAt: -1 });
directMessageSchema.index(
  { sender: 1, clientId: 1 },
  { unique: true, partialFilterExpression: { clientId: { $type: "string" } } }
);

const DirectMessageModel = mongoose.model("directmessages", directMessageSchema);

export default DirectMessageModel;
