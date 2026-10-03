import mongoose from "mongoose";

const judgeAssignmentSchema = new mongoose.Schema(
  {
    hackathon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "hackathons",
      required: true,
    },

    judge: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "admins",
      required: true,
    },

    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "admins",
      required: true,
    },

    // Being named as a judge is an invitation: nothing about judging
    // (reviewing, seeing submissions, counting toward result reveal) applies
    // until the invitee accepts.
    status: {
      type: String,
      enum: ["PENDING", "ACCEPTED", "DECLINED"],
      default: "PENDING",
    },

    respondedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

judgeAssignmentSchema.index(
  {
    hackathon: 1,
    judge: 1,
  },
  {
    unique: true,
  }
);

judgeAssignmentSchema.index({
  hackathon: 1,
});

judgeAssignmentSchema.index({
  judge: 1,
  status: 1,
});

const JudgeAssignmentModel = mongoose.model(
  "judgeAssignments",
  judgeAssignmentSchema
);

export default JudgeAssignmentModel;
