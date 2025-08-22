// import UserModel from "../models/user.models.js";
// import bcrypt from "bcryptjs";
// // import { generateVerificationToken } from "../utils/generateVerificationToken.js";
// // import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
// // import { transporter } from "../nodemailer/nodemailerConfig.js";
// import jwt from "jsonwebtoken";
// import { oauth2client } from "../utils/googleAuth.utils.js";
// import axios from "axios";

// import nodemailer from "nodemailer";
// import fs from "fs-extra";
// import Handlebars from "handlebars";
// import { sendMail } from "../nodemailer/nodemailerConfig.js";

// import dotenv from "dotenv";
// dotenv.config();

// const signup = async (req, res) => {
//   try {
//     const { email, password, name } = req.body;
//     const user = await UserModel.findOne({ email });

//     if (user) {
//       return res
//         .status(409)
//         .json({ message: "User already exist, You can login", success: false });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     const newUser = new UserModel({
//       email,
//       password: hashedPassword,
//       name,
//     });

//     await newUser.save();

//     const jwtForEmailVerificatiion = jwt.sign(
//       { _id: newUser._id },
//       process.env.SECRET_KEY,
//       {
//         expiresIn: "24h",
//       }
//     );

//     // console.log(jwtForEmailVerificatiion)

//     // res.cookie("verifyToken", jwtForEmailVerificatiion, {
//     //   httpOnly: true, // this prevent from xss attacks
//     //   secure: process.env.NODE_ENV === "production",
//     //   sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // this prevent from csrf
//     //   maxAge: 1 * 24 * 60 * 60 * 1000,
//     //   path: "/",
//     // });

//     sendVerficationToken(req, res);

//     // if (newUser.isVerified) {
//     //   const jwtToken = generateTokenAndSetCookie(
//     //     res,
//     //     newUser._id,
//     //     newUser.email
//     //   );

//     //   // sending welecome email
//     //   const mailOptions = {
//     //     from: process.env.SENDER_EMAIL,
//     //     to: email,
//     //     subject: "Welcome SKT productions!",
//     //     text: `Welcome to SKT website. Your account has been created using this email ${email}`,
//     //   };

//     //   await transporter.sendMail(mailOptions);

//     //   res.status(201).json({
//     //     message: "User created successfully",
//     //     success: true,
//     //     jwtToken,
//     //     email,
//     //     name,
//     //   });
//     // }

//     return res.status(201).json({
//       message: "User created successfully",
//       success: true,
//       verifyToken: jwtForEmailVerificatiion,
//       email,
//       name,
//     });
//   } catch (err) {
//     res.json({ message: err.message, success: false });
//   }
// };

// const login = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     const user = await UserModel.findOne({ email });

//     const errorMsg = "Authentication failed! Email or password is wrong";

//     if (!user) {
//       return res.status(403).json({ message: errorMsg, success: false });
//     }

//     const isPasswordEqual = await bcrypt.compare(password, user.password);

//     if (!isPasswordEqual) {
//       return res.status(403).json({ message: errorMsg, success: false });
//     }

//     // const jwtToken = generateTokenAndSetCookie(res, user._id, user.email);
//     const jwtToken = jwt.sign(
//       { email: user.email, _id: user._id },
//       process.env.SECRET_KEY,
//       {
//         expiresIn: "24h",
//       }
//     );

//     user.lastLogin = Date.now();

//     await user.save();

//     return res.status(201).json({
//       message: "User logged in successfully",
//       success: true,
//       token: jwtToken,
//       email,
//       name: user.name,
//     });
//   } catch (err) {
//     res.json({
//       message: err.message,
//       success: false,
//     });
//   }
// };

// // const logout = async (req, res) => {
// //   try {
// //     res.clearCookie("token", {
// //       httpOnly: true, // this prevent from xss attacks
// //       secure: process.env.NODE_ENV === "production",
// //       sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // this prevent from csrf
// //       maxAge: 1 * 24 * 60 * 60 * 1000,
// //     });

// //     return res.json({
// //       message: "Logged Out",
// //       success: true,
// //     });
// //   } catch (err) {
// //     res.json({
// //       message: err.message,
// //       success: false,
// //     });
// //   }
// // };

// const sendVerficationToken = async (req, res) => {
//   try {
//     const { email } = req.body;

//     const verificationToken = Math.floor(
//       100000 + Math.random() * 900000
//     ).toString();

//     const user = await UserModel.findOne({ email });

//     if (user.isVerified) {
//       return res.json({
//         message: "Account is alread verified",
//         success: false,
//       });
//     }

//     user.verificationToken = verificationToken;
//     user.verificationTokenExpiresAt = Date.now() + 24 * 60 * 60 * 1000;

//     await user.save();

//     const mailOption = {
//       // from: process.env.SENDER_EMAIL
//       from: process.env.EMAIL,
//       to: email,
//       subject: "Account Verification OTP",
//       text: `Your OTP is ${verificationToken}. Verify your account using this OTP.`,
//     };

//     await transporter.sendMail(mailOption);
//   } catch (err) {
//     return res.status(504).json({
//       message: err.message,
//       success: false,
//     });
//   }
// };

// const verifyEmail = async (req, res) => {
//   const { userId, verificationToken } = req.body;

//   if (!userId || !verificationToken) {
//     return res.json({ message: "Missing Details", success: false });
//   }

//   try {
//     const user = await UserModel.findById(userId);

//     if (!user) {
//       res.json({
//         message: "user not found",
//         success: false,
//       });
//     }

//     if (verificationToken !== user.verificationToken) {
//       res.json({
//         message: "Invalid OTP",
//         success: false,
//       });
//     }

//     if (user.verificationTokenExpiresAt < Date.now()) {
//       await UserModel.findByIdAndDelete(userId);
//       res.json({
//         message: "OTP Expired! Signup Again",
//         success: false,
//       });
//     }

//     user.isVerified = true;
//     await user.save();

//     // res.clearCookie("verifyToken");

//     // const jwtToken = generateTokenAndSetCookie(res, user._id, user.email);
//     const jwtToken = jwt.sign(
//       { email: user.email, _id: user._id },
//       process.env.SECRET_KEY,
//       {
//         expiresIn: "24h",
//       }
//     );

//     // sending welecome email
//     const mailOptions = {
//       // from: process.env.SENDER_EMAIL,
//       from: process.env.EMAIL,
//       to: user.email,
//       replyTo: process.env.EMAIL,
//       subject: "HackSprint",
//       text: `Welcome to HackSprint. Your account has been created using this email ${user.email}`,
//     };

//     await transporter.sendMail(mailOptions);

//     return res.status(201).json({
//       message: "User verified successfully",
//       success: true,
//       token: jwtToken,
//       email: user.email,
//       name: user.name,
//     });
//   } catch (err) {
//     return res.json({
//       message: "i am boss",
//       success: false,
//     });
//   }
// };

// // Send password reset OTP
// const sendResetOTP = async (req, res) => {
//   try {
//     const { email } = req.body;

//     if (!email) {
//       return res.json({
//         message: "Email is required",
//         success: false,
//       });
//     }

//     const user = await UserModel.findOne({ email });

//     if (!user) {
//       return res.json({
//         message: "User not found..",
//         success: false,
//       });
//     }

//     const resetPasswordToken = Math.floor(
//       100000 + Math.random() * 900000
//     ).toString();
//     user.resetPasswordToken = resetPasswordToken;
//     user.resetPasswordExpiresAt = Date.now() + 15 * 60 * 1000;

//     await user.save();

//     const mailOption = {
//       // from: process.env.SENDER_EMAIL,
//       from: process.env.EMAIL,
//       to: email,
//       subject: "Reset Password OTP",
//       text: `Your OTP is ${resetPasswordToken}.Reset your password using this OTP.`,
//     };

//     await transporter.sendMail(mailOption);

//     return res.json({
//       message: "OTP sent to your email for reset password",
//       success: true,
//     });
//   } catch (err) {
//     return res.json({
//       message: err.message,
//       success: false,
//     });
//   }
// };

// const resetPassword = async (req, res) => {
//   try {
//     const { email, resetPasswordToken, newPassword } = req.body;

//     if (!email || !resetPasswordToken || !newPassword) {
//       return res.json({
//         message: "Email, OTP, and newPassword are required",
//         success: false,
//       });
//     }

//     const user = await UserModel.findOne({ email });

//     if (!user) {
//       return res.json({
//         message: "User not found",
//         success: false,
//       });
//     }

//     if (
//       user.resetPasswordToken === "" ||
//       user.resetPasswordToken !== resetPasswordToken
//     ) {
//       return res.json({
//         message: "Invalid OTP",
//         success: false,
//       });
//     }

//     if (user.resetPasswordExpiresAt < Date.now()) {
//       return res.json({
//         message: "OTP Expired",
//         success: false,
//       });
//     }

//     const isPasswordEqual = await bcrypt.compare(newPassword, user.password);

//     if (isPasswordEqual) {
//       return res.json({
//         message: "New password cannot be same as old password!",
//         success: false,
//       });
//     }

//     const newHashedPassword = await bcrypt.hash(newPassword, 10);
//     user.password = newHashedPassword;

//     user.resetPasswordToken = "";
//     user.resetPasswordExpiresAt = null;

//     await user.save();

//     return res.json({
//       message: "Password has been reset successfully",
//       success: true,
//     });
//   } catch (err) {
//     return res.json({
//       message: err.message,
//       success: false,
//     });
//   }
// };

// const googleLogin = async (req, res) => {
//   try {
//     const { code } = req.query;

//     if (!code) {
//       return res
//         .status(400)
//         .json({ message: "Code not provided", success: false });
//     }

//     const googleRes = await oauth2client.getToken(code);
//     oauth2client.setCredentials(googleRes.tokens);

//     const tokens = googleRes.tokens;

//     const userRes = await axios.get(
//       `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${tokens.access_token}`
//     );

//     const { name, email } = userRes.data;

//     let user = await UserModel.findOne({ email });

//     let isFirstTime = false;

//     if (!user) {
//       isFirstTime = true;

//       user = await UserModel.create({
//         name,
//         email,
//         provider: "google",
//         isVerified: true,
//       });
//     }

//     const { _id } = user;

//     const jwtToken = jwt.sign({ email, _id }, process.env.SECRET_KEY, {
//       expiresIn: "24h",
//     });

//     // const jwtToken = generateTokenAndSetCookie(res, user._id, user.email);

//     // res.cookie("token", jwtToken, {
//     //   httpOnly: true,
//     //   secure: process.env.NODE_ENV === "production",
//     //   sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
//     //   maxAge: 24 * 60 * 60 * 1000,
//     // });

//     // sending welecome email
//     const mailOptions = {
//       // from: process.env.SENDER_EMAIL,
//       from: process.env.EMAIL,
//       to: user.email,
//       replyTo: process.env.EMAIL,
//       subject: "HackSprint",
//       // text: `Welcome to HackSprint. Your account has been created using this email ${user.email}`,
//     };

//     if (isFirstTime) {
//       // await transporter.sendMail(mailOptions);
//       await sendMail({
//         to: user.email, // <-- user's email from DB
//         subject: "Welcome to HackSprint 🎉",
//         templateName: "welcome",
//         data: {
//           username: user.name,
//           support_email: "support@hacksprint.in",
//         },
//       });
//     }

//     return res.status(201).json({
//       message: "login successfully",
//       success: true,
//       token: jwtToken,
//       email,
//       name: user.name,
//     });
//   } catch (err) {
//     console.error("🔥 Error in googleLogin:", err);
//     return res.status(500).json({
//       message: "Internal server error",
//       success: false,
//     });
//   }
// };

// async function renderTemplate(filePath, data) {
//   const source = await fs.readFile(filePath, "utf8");
//   const template = Handlebars.compile(source);
//   return template(data);
// }

// export { signup, login, verifyEmail, sendResetOTP, resetPassword, googleLogin };

import UserModel from "../models/user.models.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { oauth2client } from "../utils/googleAuth.utils.js";
import axios from "axios";
import { sendMail } from "../nodemailer/nodemailerConfig.js";
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

    console.log("bye...")

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
      { expiresIn: "24h" }
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
    console.log("hello")
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
      templateName: "welcome",
      data: {
        name: user.name,
        email: user.email,
      },
    });

    return res.redirect("http://localhost:5173/?verified=success");

  } catch (err) {
    console.error("Verify error:", err);
    return res.redirect("http://localhost:5173/?verified=failed");
  }
};

/**
 * SEND RESET LINK - sends a secure reset link to user email
 */
const sendResetLink = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await UserModel.findOne({ email });
    if (!user)
      return res
        .status(404)
        .json({ message: "User not found", success: false });

    const resetToken = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, {
      expiresIn: "15m",
    });

    const resetUrl = `${process.env.FRONTEND_URL}/account/reset-password?token=${resetToken}`;

    await sendMail({
      to: email,
      subject: "Reset your password - HackSprint",
      templateName: "resetPassword",
      data: { name: user.name, email: user.email, resetUrl: resetUrl },
    });

    res.json({
      message: "Password reset link sent to your email",
      success: true,
    });
  } catch (err) {
    console.error("Reset link error:", err);
    res
      .status(500)
      .json({ message: "Server error", error: err.message, success: false });
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
      data: { name: user.name, email: user.email},
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
    const { email, password } = req.body;
    const user = await UserModel.findOne({ email });

    const errorMsg = "Authentication failed! Email or password is wrong";

    if (!user)
      return res.status(403).json({ message: errorMsg, success: false });

    const isPasswordEqual = await bcrypt.compare(password, user.password);
    if (!isPasswordEqual)
      return res.status(403).json({ message: errorMsg, success: false });

    if (!user.isVerified) {
      return res
        .status(403)
        .json({ message: "Please verify your email first", success: false });
    }

    const jwtToken = jwt.sign(
      { email: user.email, _id: user._id },
      process.env.SECRET_KEY,
      { expiresIn: "24h" }
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
      { expiresIn: "24h" }
    );

    if (isFirstTime) {
      await sendMail({
        to: user.email,
        subject: "Welcome to HackSprint 🎉",
        templateName: "welcome",
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

export {
  signup,
  login,
  verifyEmail,
  sendResetLink,
  resetPassword,
  googleLogin,
};
