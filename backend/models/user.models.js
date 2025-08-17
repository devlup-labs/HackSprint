import mongoose from "mongoose";

// const userSchema = new mongoose.Schema({
//     name: {
//         type: String,
//         required: true
//     }, 
//     email: {
//         type: String,
//         required: true
//     },
//     submissions: {
//         type: Array
//     }
// }, { timestamps: true })

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      // required: true,
    },

    provider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },

    name: {
      type: String,
      required: true,
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
    isGitHubloggedIn:{
      type : Boolean
    },
    isGoogleLoggedIn:{
      type : Boolean
    },
    verificationTokenExpiresAt: Date,
    // Submissions
  },
  { timestamps: true }
);

const UserModel = mongoose.model("users", userSchema)

export default UserModel