import mongoose from "mongoose";

const adminSchema = new mongoose.Schema(
  {
    avatar: {
      type: String,
      default: "",
    },

    adminName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    role: {
      type: String,
      enum: ["ADMIN", "JUDGE"],
      default: "ADMIN",
    },

    controller: {
      type: Boolean,
      default: false,
      immutable: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    refreshTokenHash: {
      type: String,
      default: null,
      select: false,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    verificationStatus: {
      type: String,
      enum: ["NOT_SUBMITTED", "PENDING", "APPROVED", "REJECTED"],
      default: "NOT_SUBMITTED",
    },

    profileCompleted: {
      type: Boolean,
      default: false,
    },

    organizationName: {
      type: String,
      default: "",
      trim: true,
    },

    organizerType: {
      type: String,
      enum: ["INDIVIDUAL", "COLLEGE", "COMPANY", "COMMUNITY", "STARTUP", "STUDIO"],
      default: "INDIVIDUAL",
    },

    contactNumber: {
      type: String,
      validate: {
        validator(v) {
          return !v || /^\+?[0-9]{10,15}$/.test(v);
        },
        message: (props) => `${props.value} is not a valid phone number`,
      },
    },

    country: {
      type: String,
      default: "",
      trim: true,
    },

    bio: {
      type: String,
      default: "",
      maxlength: 1000,
    },

    website: {
      type: String,
      default: "",
      trim: true,
    },

    linkedin: {
      type: String,
      default: "",
      trim: true,
    },

    verificationDocument: {
      url: {
        type: String,
        default: "",
      },
      key: {
        type: String,
        default: "",
      },
    },

    // What the organizer told the controller about themselves, plus the
    // supporting documents (see utils/organizerVerification.js).
    verificationDetails: {
      legalName: { type: String, default: "" },
      registrationNumber: { type: String, default: "" },
      registeredAddress: {
        line1: { type: String, default: "" },
        city: { type: String, default: "" },
        state: { type: String, default: "" },
        postalCode: { type: String, default: "" },
        country: { type: String, default: "" },
      },
      officialEmail: { type: String, default: "" },
      organizationWebsite: { type: String, default: "" },
      contactPerson: {
        name: { type: String, default: "" },
        designation: { type: String, default: "" },
        phone: { type: String, default: "" },
      },
      eventExperience: { type: String, default: "" },
      planDescription: { type: String, default: "" },
      declaration: { type: Boolean, default: false },
    },

    verificationDocuments: [
      {
        type: { type: String },
        name: { type: String, default: "" },
        url: { type: String, default: "" },
        key: { type: String, default: "" },
      },
    ],

    verificationSubmittedAt: {
      type: Date,
      default: null,
    },

    verificationRemarks: {
      type: String,
      default: "",
    },

    verifiedAt: {
      type: Date,
      default: null,
    },

    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "admins",
      default: null,
    },

    lastLogin: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

adminSchema.index({
  email: 1,
});

adminSchema.index({
  role: 1,
});

adminSchema.index({
  isVerified: 1,
});

adminSchema.index({
  verificationStatus: 1,
});

const Admin = mongoose.model("admins", adminSchema);

export default Admin;
