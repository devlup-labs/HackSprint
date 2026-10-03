import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    image: {
      url: {
        type: String,
        default: "",
      },
      key: {
        type: String,
        default: "",
      },
    },
    userName: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      select: false,
    },
    provider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    bio: {
      type: String,
      default: "",
      maxlength: 500,
    },
    location: {
      type: String,
      default: "",
    },
    teams: {
      type: [
        {
          hackathon: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "hackathons",
          },
          team: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Team",
          },
        },
      ],
      default: [],
    },
    role: {
      type: String,
      enum: ["participant"],
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
      select: false,
    },
    resetPasswordExpiresAt: Date,
    verificationToken: {
      type: String,
      default: "",
      select: false,
    },
    verificationTokenExpiresAt: Date,
    contactNumber: {
      type: String,
      trim: true,
      default: "",
      validate: {
        validator: function (v) {
          return !v || /^\+?[0-9]{10,15}$/.test(v);
        },
        message: (props) => `${props.value} is not a valid phone number!`,
      },
    },
    gender: {
      type: String,
      enum: ["male", "female", "other", "prefer_not_to_say"],
    },
    badges: {
      type: [String],
      default: [],
    },
    leaderOfHackathons: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "hackathons",
      default: [],
    },
    registeredHackathons: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "hackathons",
      default: [],
    },
    submittedHackathons: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "hackathons",
      default: [],
    },
    wishlist: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "hackathons",
      default: [],
    },
    education: {
      type: [
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
      default: [],
    },
    connectedApps: {
      type: [
        {
          appName: {
            type: String,
            required: true,
          },
          appURL: {
            type: String,
            required: true,
          },
        },
      ],
      default: [],
    },
    skills: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

userSchema.index({
  userName: 1,
});
userSchema.index({
  isVerified: 1,
});
userSchema.virtual("submissions", {
  ref: "submissions",
  localField: "_id",
  foreignField: "participant",
});
userSchema.virtual("publicProfile").get(function () {
  return {
    _id: this._id,
    name: this.name,
    userName: this.userName,
    image: this.image?.url || "",
    bio: this.bio,
    location: this.location,
    connectedApps: this.connectedApps,
    skills: this.skills,
    badges: this.badges,
  };
});
userSchema.virtual("profileCompletion").get(function () {
  let completed = 0;
  const total = 8;

  if (this.image?.url) completed++;
  if (this.userName) completed++;
  if (this.bio) completed++;
  if (this.location) completed++;
  if (this.contactNumber) completed++;
  if (this.education?.length > 0) completed++;
  if (this.connectedApps?.length > 0) completed++;
  if (this.skills?.length > 0) completed++;

  return Math.round((completed / total) * 100);
});
userSchema.set("toObject", {
  virtuals: true,
});
userSchema.set("toJSON", {
  virtuals: true,
});

const UserModel = mongoose.model("users", userSchema);

export default UserModel;
