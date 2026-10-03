import mongoose from "mongoose";

const registeredParticipantsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  hackathon: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "hackathons",
    required: true,
  },
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "teams",
    default: null,
  },
  formData: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

registeredParticipantsSchema.index({
  user: 1,
});

registeredParticipantsSchema.index({
  hackathon: 1,
});

registeredParticipantsSchema.index(
  {
    user: 1,
    hackathon: 1,
  },
  {
    unique: true,
  }
);

const RegisteredParticipantsModel = mongoose.model(
  "registeredParticipants",
  registeredParticipantsSchema
);

export default RegisteredParticipantsModel;
