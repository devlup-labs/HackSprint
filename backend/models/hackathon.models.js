import mongoose from "mongoose";

const hackathonSchema = new mongoose.Schema(
  {
    image: {
      type: String,
    },
    title: {
      type: String,
      required: true,
    },
    subTitle: {
      type: String,
    },
    description: {
      type: String,
    },
    submissions: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "submissions" }],
      //No. of participants of a hackathon are equal to submissions array no.of elements.
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    submissionStartDate: {
      type: Date,
    },
    submissionEndDate: {
      type: Date,
    },
    votingDate: {
      type: Date,
    },
    refMaterial: {
      type: [String],
    },
    status: {
      type: Boolean,
      default: false,
    },
    difficulty: {
      type: String,
      enum: {
        values: ["Advanced", "Expert", "Intermediate", "Beginner", "Tough"],
      },
    },
    category: {
      type: Array,
    },
    rewards: [
      {
        description: { type: String, required: true },
        amount: { type: Number, required: true },
      },
    ],
    prizeMoney1: {
      type: Number,
    },
    prizeMoney2: {
      type: Number,
    },
    prizeMoney3: {
      type: Number,
    },
    techStackUsed: {
      type: Array,
    },
    numParticipants: {
      type: Number,
      default: 0,
    },
    overview: {
      type: String,
    },
    themes: {
      type: [String],
    },
    FAQs: [
      {
        question: { type: String },
        answer: { type: String },
      },
    ],
    teams: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "teams" }],
    },
    aboutUs: {
      type: String,
    },
    projectSubmission: {
      type: [String],
    },
    TandCforHackathon: {
      type: [String],
    },
    evaluationCriteria: {
      type: [String],
    },
    registeredParticipants: [
      { type: mongoose.Schema.Types.ObjectId, ref: "registeredParticipants" },
    ],
    allowedFileTypes: {
      docs: { type: [String], default: ["pdf", "docx"] }, // default docs
      images: { type: [String], default: ["jpg", "jpeg", "png"] }, // default images
      videos: { type: [String], default: ["mp4"] }, // default videos
    },
    gallery: [
      {
        type: String,
        required: true,
      },
    ],
    showVoting: {
      type: Boolean,
      default: true,
    },
    showResult: {
      type: Boolean,
      default: true,
    },
    contact: [
      {
        title: { type: String, required: true },
        value: { type: String, required: true }
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
  },
  { timestamps: true }
);

hackathonSchema.pre(/^find/, async function (next) {
  const currentTime = new Date(Date.now());
  //mark status:true for active hackathons
  await this.model.updateMany(
    {
      startDate: { $lte: currentTime },
      submissionEndDate: { $gte: currentTime },
    },
    {
      status: true,
    }
  );

  //mark status : false for inactive hackathons
  await this.model.updateMany(
    {
      submissionEndDate: { $lt: currentTime },
    },
    { status: false }
  );

  next();
});
const hackathonModel = mongoose.model("hackathons", hackathonSchema);

export default hackathonModel;
