import UserModel from "../models/user.models.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { oauth2client } from "../utils/googleAuth.utils.js";
import axios from "axios";
import { sendMail } from "../emailService/brevoEmail.js";
import dotenv from "dotenv";
dotenv.config();

/**
 * SIGNUP - creates user, sends verification email
 */
const signup = async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const existingUser = await UserModel.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        message: "User already exists, please login",
        success: false,
      });
    }

    console.log("bye...");

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await UserModel.create({
      email,
      password: hashedPassword,
      name,
      isVerified: false,
    });

    // Generate verification token (expires in 24h)
    const verifyToken = jwt.sign(
      { userId: newUser._id },
      process.env.SECRET_KEY,
      { expiresIn: process.env.JWT_EXPIRE_TIME }
    );

    const verifyUrl = `${process.env.FRONTEND_URL}/verify?token=${verifyToken}`;

    // Send verification email
    await sendMail({
      to: newUser.email,
      subject: "Verify your HackSprint account",
      templateName: "verify",
      data: {
        name: newUser.name,
        email: newUser.email,
        verifyUrl: verifyUrl,
      },
    });

    return res.status(201).json({
      message:
        "Signup successful. Please check your email to verify your account.",
      success: true,
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

/**
 * VERIFY EMAIL - called when user clicks email link
 */
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ message: "Token missing", success: false });
    }

    // Decode token
    console.log("hello");
    console.log("Verifying token:", token);
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    console.log("Decoded JWT:", decoded);
    const user = await UserModel.findById(decoded.userId);

    if (!user) {
      return res.status(400).json({ message: "Invalid token", success: false });
    }

    if (user.isVerified) {
      return res
        .status(200)
        .json({ message: "User already verified", success: true });
    }

    user.isVerified = true;
    await user.save();

    // Send welcome email
    await sendMail({
      to: user.email,
      subject: "Welcome to HackSprint 🎉",
      templateName: "userWelcome",
      data: {
        name: user.name,
        email: user.email,
      },
    });

    return res.redirect(`${process.env.FRONTEND_URL}/?verified=success`);
  } catch (err) {
    console.error("Verify error:", err);
    return res.redirect(`${process.env.FRONTEND_URL}/?verified=failed`);
  }
};

/**
 * SEND RESET LINK - sends a secure reset link to user email
 */
const sendResetLink = async (req, res) => {
  try {
    let { email } = req.body;

    email = email.toLowerCase().trim();

    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "User not registered. Please check and try again.",
        success: false,
      });
    }

    if (user.provider && user.provider !== "local") {
      return res.status(400).json({
        message: `This account uses ${user.provider} login. Please login using ${user.provider}.`,
        success: false,
      });
    }

    if (!user.password) {
      return res.status(400).json({
        message: "Password reset not available for this account.",
        success: false,
      });
    }

    const resetToken = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, {
      expiresIn: "15m",
    });

    const resetUrl = `${process.env.FRONTEND_URL}/account/reset-password?token=${resetToken}`;

    await sendMail({
      to: user.email,
      subject: "Reset your password - HackSprint",
      templateName: "resetPassword",
      data: {
        name: user.name,
        email: user.email,
        resetUrl,
      },
    });

    return res.json({
      message: "If an account exists, a reset link has been sent.",
      success: true,
    });
  } catch (err) {
    console.error("Reset link error:", err);
    res.status(500).json({
      message: "Server error",
      error: err.message,
      success: false,
    });
  }
};

/**
 * RESET PASSWORD - user submits new password with token
 */
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Token missing", success: false });
    }

    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    const user = await UserModel.findById(decoded.userId);

    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found", success: false });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    await sendMail({
      to: user.email,
      subject: "Your password has been reset - HackSprint",
      templateName: "resetPasswordSuccess",
      data: { name: user.name, email: user.email },
    });

    res.json({ message: "Password reset successful", success: true });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(400).json({
      message: "Invalid or expired token",
      success: false,
    });
  }
};

/**
 * LOGIN - only works if account is verified
 */
const login = async (req, res) => {
  try {
    let { email, password } = req.body;

    email = email.toLowerCase().trim();

    const user = await UserModel.findOne({ email });

    const errorMsg = "Authentication failed! Email or password is wrong";

    if (!user) {
      return res.status(401).json({ message: errorMsg, success: false });
    }

    if (user.provider && user.provider !== "local") {
      return res.status(400).json({
        message: `This email is registered using ${user.provider}. Please login with ${user.provider}.`,
        success: false,
      });
    }

    if (!user.password) {
      return res.status(400).json({
        message: "Password login not available for this account",
        success: false,
      });
    }

    const isPasswordEqual = await bcrypt.compare(password, user.password);

    if (!isPasswordEqual) {
      return res.status(401).json({ message: errorMsg, success: false });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        message: "Please verify your email first",
        success: false,
      });
    }

    const jwtToken = jwt.sign(
      { email: user.email, _id: user._id },
      process.env.SECRET_KEY,
      { expiresIn: process.env.JWT_EXPIRE_TIME }
    );

    user.lastLogin = Date.now();
    await user.save();

    return res.status(200).json({
      message: "User logged in successfully",
      success: true,
      token: jwtToken,
      email,
      name: user.name,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};
/**
 * GOOGLE LOGIN - no email verification required
 */
const googleLogin = async (req, res) => {
  try {
    const { code } = req.query;
    if (!code)
      return res
        .status(400)
        .json({ message: "Code not provided", success: false });

    const googleRes = await oauth2client.getToken(code);
    oauth2client.setCredentials(googleRes.tokens);

    const tokens = googleRes.tokens;
    const userRes = await axios.get(
      `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${tokens.access_token}`
    );

    const { name, email } = userRes.data;

    let user = await UserModel.findOne({ email });
    let isFirstTime = false;

    if (!user) {
      isFirstTime = true;
      user = await UserModel.create({
        name,
        email,
        provider: "google",
        isVerified: true,
      });
    }

    const jwtToken = jwt.sign(
      { email, _id: user._id },
      process.env.SECRET_KEY,
      { expiresIn: process.env.JWT_EXPIRE_TIME }
    );

    if (isFirstTime) {
      await sendMail({
        to: user.email,
        subject: "Welcome to HackSprint 🎉",
        templateName: "userWelcome",
        data: { name: user.name, email: user.email },
      });
    }

    return res.status(200).json({
      message: "Login successful",
      success: true,
      token: jwtToken,
      email,
      name: user.name,
    });
  } catch (err) {
    console.error("🔥 Error in googleLogin:", err);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

/**
 * GITHUB LOGIN - no email verification required
 */
const githubLogin = async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) {
      return res
        .status(400)
        .json({ message: "Code not provided", success: false });
    }

    const params = new URLSearchParams();
    params.append("client_id", process.env.GITHUB_CLIENT_ID);
    params.append("client_secret", process.env.GITHUB_CLIENT_SECRET);
    params.append("code", code);

    // Exchange code for access token
    const tokenRes = await axios.post(
      "https://github.com/login/oauth/access_token",
      params.toString(),
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const accessToken = tokenRes.data.access_token;
    if (!accessToken) {
      return res
        .status(400)
        .json({ message: "Invalid GitHub code", success: false });
    }

    // Get user info from GitHub
    const userRes = await axios.get("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!isIITJEmail(email)) {
      return res.status(403).json({
        message: "Only iitj emails are allowed.",
        success: false,
      });
    }

    // GitHub may not always return email here (depends on privacy settings).
    let email = userRes.data.email;
    if (!email) {
      const emailRes = await axios.get("https://api.github.com/user/emails", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const primaryEmail = emailRes.data.find((e) => e.primary && e.verified);
      email = primaryEmail?.email;
    }

    if (!email) {
      return res
        .status(400)
        .json({ message: "Email not available from GitHub", success: false });
    }

    const name = userRes.data.name || userRes.data.login;

    // Create or find user
    let user = await UserModel.findOne({ email });
    let isFirstTime = false;
    if (!user) {
      isFirstTime = true;
      user = await UserModel.create({
        name,
        email,
        provider: "github",
        isVerified: true,
      });
    }

    // Generate JWT
    const jwtToken = jwt.sign(
      { email, _id: user._id },
      process.env.SECRET_KEY,
      { expiresIn: "24h" }
    );

    // Send welcome email (only on first login)
    if (isFirstTime) {
      await sendMail({
        to: user.email,
        subject: "Welcome to HackSprint 🎉",
        templateName: "welcome",
        data: { name: user.name, email: user.email },
      });
    }

    // Respond with JSON for frontend to handle like Google login
    return res.json({
      message: "GitHub login successful",
      success: true,
      token: jwtToken,
      email,
      name: user.name,
    });
  } catch (err) {
    console.error("🔥 Error in githubLogin:", err);
    return res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
};

export {
  signup,
  login,
  verifyEmail,
  sendResetLink,
  resetPassword,
  googleLogin,
  githubLogin,
};
