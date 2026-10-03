import express from "express";
import {
  googleLogin,
  googleOneTap,
  login,
  resetPassword,
  sendResetLink,
  signup,
  verifyEmail,
  refreshToken,
  logout
} from "../controllers/auth.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { signupSchema, loginSchema, resetPasswordSchema, sendResetLinkSchema } from "../validations/auth.validation.js";
import rateLimit from "express-rate-limit";

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, 
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return res.status(429).json({
      success: false,
      message: "Too many requests, please try again later.",
    });
  },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return res.status(429).json({
      success: false,
      message:
        "Too many attempts. Please try again later.",
    });
  },
});

const router = express.Router();

router.post("/signup", limiter, validate(signupSchema), signup);
router.get("/verify-email", limiter, verifyEmail);
router.post("/send-reset-link", authLimiter, validate(sendResetLinkSchema), sendResetLink);
router.post("/reset-password", authLimiter, validate(resetPasswordSchema), resetPassword);
router.post("/login", authLimiter, validate(loginSchema), login);
router.get("/google", authLimiter, googleLogin);
router.post("/google/one-tap", authLimiter, googleOneTap);
router.post("/refresh-token", limiter, refreshToken);
router.post("/logout", limiter, logout);

export default router;
