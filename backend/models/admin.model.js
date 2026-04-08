import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
    avatar: {
        type: String
    },
    adminName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {  // hashed password
        type: String,
        required: false,
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
    contactNumber: {
      type: String,
      // required: true,
      validate: {
        validator: function (v) {
          return /^\+?[0-9]{10,15}$/.test(v);
        },
        message: props => `${props.value} is not a valid phone number!`
      }
    },
    controller:{
        type : Boolean,
        default : false,
        immutable: true
    }
}, { timestamps: true });

const Admin = mongoose.model("admins", adminSchema);
export default Admin;
