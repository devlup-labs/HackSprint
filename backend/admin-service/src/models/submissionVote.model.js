import mongoose from "mongoose";

const submissionVoteSchema = new mongoose.Schema(
  {
    submission: {
      type: mongoose.Schema.Types.ObjectId,

      ref: "submissions",

      required: true,
    },

    hackathon: {
      type: mongoose.Schema.Types.ObjectId,

      ref: "hackathons",

      required: true,
    },

    voter: {
      type: mongoose.Schema.Types.ObjectId,

      ref: "users",

      required: true,
    },
  },
  {
    timestamps: true,
  }
);

submissionVoteSchema.index(
  {
    submission: 1,
    voter: 1,
  },
  {
    unique: true,
  }
);

export default mongoose.model("SubmissionVote", submissionVoteSchema);
