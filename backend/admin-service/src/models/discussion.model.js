import mongoose from "mongoose";

const discussionSchema = new mongoose.Schema(
  {
    hackathon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "hackathons",
      required: true,
      index: true,
    },

    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },

    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },

    parentMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "discussions",
      default: null,
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

discussionSchema.index({
  hackathon: 1,
  createdAt: -1,
});

const DiscussionModel = mongoose.model("discussions", discussionSchema);

export default DiscussionModel;
