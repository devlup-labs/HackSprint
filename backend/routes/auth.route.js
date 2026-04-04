import express from "express";
import {
  googleLogin,
  githubLogin,
  login,
  resetPassword,
  sendResetLink,
  signup,
  verifyEmail,
} from "../controllers/auth.controller.js";
import {
  loginValidation,
  signupValidation,
} from "../middlewares/authValidation.js";
import rateLimit from "express-rate-limit";

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 30,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: "Too many requests, please try again later.",
    });
  },
});

const router = express.Router();

router.post("/signup", limiter, signup);
router.get("/verify-email", limiter, verifyEmail);
router.post("/send-reset-link", limiter, sendResetLink);
router.post("/reset-password", limiter, resetPassword);
router.post("/login", limiter, login);
router.get("/google", limiter, googleLogin);
router.get("/auth/callback/github", limiter, githubLogin);

export default router;
