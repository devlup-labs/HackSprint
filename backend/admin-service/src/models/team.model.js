import mongoose from "mongoose";

const teamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    leader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
      },
    ],
    pendingMembers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
      },
    ],
    hackathon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "hackathons",
      required: true,
    },
    secretCode: {
      type: String,
      required: true,
      trim: true,
    },
    maxTeamSize: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

teamSchema.index(
  {
    secretCode: 1,
  },
  {
    unique: true,
  }
);

teamSchema.index({
  hackathon: 1,
});

teamSchema.index({
  leader: 1,
});

teamSchema.index(
  {
    hackathon: 1,
    name: 1,
  },
  {
    unique: true,
  }
);

const TeamModel = mongoose.model("teams", teamSchema);

export default TeamModel;
