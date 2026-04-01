import mongoose from "mongoose";

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  leader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  leaderName: {
    type: String,
    required: true,
  },
  leaderEmail: {
    type: String,
    required: true,
  },
  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
  ],
  secretCode: {
    type: String,
  },
  secretLink: {
    type: String,
  },
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

  createdAt: {
    type: Date,
    default: Date.now,
  },
  teamSize: {
    type: Number,
  },
  maxTeamSize: {
    type: Number,
    default: 5,
  },
});

teamSchema.pre("save", function (next) {
  // teamSize = leader (1) + number of members
  this.teamSize = 1 + this.members.length;
  next();
});

const TeamModel = mongoose.model("teams", teamSchema);
export default TeamModel;
