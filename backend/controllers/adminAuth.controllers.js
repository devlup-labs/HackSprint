import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Admin from "../models/admin.model.js";
import { oauth2client } from "../utils/googleAuth.utils.js";
import { sendMail } from "../emailService/brevoEmail.js";
import axios from "axios";

export const adminSignup = async (req, res) => {
  try {
    const { adminName, email, password } = req.body;

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ error: "Admin already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = new Admin({
      adminName,
      email,
      password: hashedPassword,
    });

    await newAdmin.save();

    res.status(201).json({ message: "Admin registered successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(400).json({ error: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    // KEY CHANGE: Using the correct environment variable name from your .env file
    const token = jwt.sign(
      { id: admin._id, role: "admin" },
      process.env.SECRET_KEY,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token,
      admin: {
        id: admin._id,
        name: admin.adminName,
        email: admin.email,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const adminGoogleLogin = async (req, res) => {
  try {
    const { code } = req.query;

    if (!code) {
      return res.status(400).json({
        message: "Code not provided",
        success: false,
      });
    }

    const googleRes = await oauth2client.getToken(code);
    oauth2client.setCredentials(googleRes.tokens);

    const tokens = googleRes.tokens;

    const userRes = await axios.get(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
        },
      }
    );

    const { name, email } = userRes.data;

    let admin = await Admin.findOne({ email });
    let isFirstTime = false;

    if (!admin) {
      isFirstTime = true;

      admin = await Admin.create({
        adminName: name,
        email,
        provider: "google",
      });
    }

    if (isFirstTime) {
      await sendMail({
        to: admin.email,
        subject: "Welcome Admin 🎉 - HackSprint",
        templateName: "adminWelcome",
        data: {
          name: admin.adminName,
          email: admin.email,
        },
      });
    }

    const token = jwt.sign(
      { id: admin._id, role: "admin" },
      process.env.SECRET_KEY,
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      message: "Admin login successful",
      success: true,
      token,
      role: "admin",
      admin: {
        id: admin._id,
        name: admin.adminName,
        email: admin.email,
      },
    });
  } catch (err) {
    console.error("Admin Google Error:", err);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};
