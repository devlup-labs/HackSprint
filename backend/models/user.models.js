import mongoose, { Mongoose } from "mongoose";

const userSchema = new mongoose.Schema(
  {
    image: {
      type: String,
    },
    userName: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
    },

    provider: {
      type: String,
      enum: ["local", "google", "github"],
      default: "local",
    },
    name: {
      type: String,
      required: true,
    },
    teams: [
      {
        hackathon: { type: mongoose.Schema.Types.ObjectId, ref: "hackathons" },
        team: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
      },
    ],
    role: {
      type: String,
      enum: ["participant", "organizer", "admin"],
      default: "participant",
    },

    lastLogin: {
      type: Date,
      default: Date.now,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    resetPasswordToken: {
      type: String,
      default: "",
    },

    resetPasswordExpiresAt: Date,

    verificationToken: {
      type: String,
      default: "",
    },
    isGitHubloggedIn: {
      type: Boolean,
      default: false,
    },
    isGoogleLoggedIn: {
      type: Boolean,
      default: false,
    },
    gitHubLink: {
      type: String,
    },
    gitHubAccessToken: {
      type: String,
      default: "",
    },
    streaks: {
      type: Number,
      default: 0,
    },
    points: {
      type: Number,
      default: 0,
    },
    devQuestionsCorrectlyAnswered: {
      type: Number,
      default: 0,
    },
    devQuestionsIncorrectlyAnswered: {
      type: Number,
      default: 0,
    },
    currentQuizPoints: { type: Number, default: 0 },
    currentQuizTotalPoints: { type: Number, default: 0 },
    contactNumber: {
      type: String,
      // required: true,
      validate: {
        validator: function (v) {
          return /^\+?[0-9]{10,15}$/.test(v);
        },
        message: (props) => `${props.value} is not a valid phone number!`,
      },
    },
    leaderOfHackathons: [
      { type: mongoose.Schema.Types.ObjectId, ref: "hackathons" },
    ],
    registeredHackathons: [
      { type: mongoose.Schema.Types.ObjectId, ref: "hackathons" },
    ],
    submittedHackathons: [
      { type: mongoose.Schema.Types.ObjectId, ref: "hackathons" },
    ],
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "hackathons" }],
    attemptedDevQuestions: [
      { type: mongoose.Schema.Types.ObjectId, ref: "dailyQuiz" },
    ],
    devQuestionSubmittedTime: {
      type: Date,
    },
    education: [
      {
        institute: {
          type: String,
          required: true,
        },
        passOutYear: {
          type: String,
          required: true,
        },
        department: {
          type: String,
          required: true,
        },
        location: {
          type: String,
          required: true,
        },
      },
    ],
    connectedApps: [
      {
        appName: { type: String, required: true },
        appURL: { type: String, required: true },
      },
    ],
    languages: [
      {
        language: { type: String, required: true },
      },
    ],
    skills: [
      {
        skill: { type: String, required: true },
      },
    ],
    coins: {
      type: Number,
      default: 0,
    },
    hackathonPoints: {
      type: Number,
      default: 0,
    },
    verificationTokenExpiresAt: Date,
  },
  { timestamps: true }
);

userSchema.virtual("submissions", {
  ref: "submissions",
  localField: "_id",
  foreignField: "participant",
});
userSchema.set("toObject", { virtuals: true });
userSchema.set("toJSON", { virtuals: true });
const UserModel = mongoose.model("users", userSchema);

export default UserModel;
