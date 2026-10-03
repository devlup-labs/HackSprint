import mongoose from "mongoose";

const submissionReviewSchema =
  new mongoose.Schema(
    {
      submission: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "submissions",
        required: true,
      },

      hackathon: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "hackathons",
        required: true,
      },

      judge: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "admins",
        required: true,
      },

      score: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
      },

      feedback: {
        type: String,
        trim: true,
        maxlength: 5000,
        default: "",
      },
    },
    {
      timestamps: true,
    }
  );

submissionReviewSchema.index(
  {
    submission: 1,
    judge: 1,
  },
  {
    unique: true,
  }
);

submissionReviewSchema.index({
  hackathon: 1,
});

submissionReviewSchema.index({
  judge: 1,
});

submissionReviewSchema.index({
  submission: 1,
});

const SubmissionReviewModel =
  mongoose.model(
    "submissionReviews",
    submissionReviewSchema
  );

export default SubmissionReviewModel;