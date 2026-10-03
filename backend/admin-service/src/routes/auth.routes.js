import express from "express";
import rateLimit from "express-rate-limit";
import {
  adminGoogleLogin,
  adminGoogleOneTap,
  adminRefreshToken,
  adminLogout,
} from "../controllers/adminAuth.controller.js";
// import { redirectToGoogle } from "../utils/googleAuth.utils.js";

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

const router = express.Router();

router.get("/google", limiter, adminGoogleLogin);
router.post("/google/one-tap", limiter, adminGoogleOneTap);
router.post("/refresh-token", limiter, adminRefreshToken);
router.post("/logout", limiter, adminLogout);
// router.get("/google", redirectToGoogle);

// router.get("/google/callback", adminGoogleLogin);
export default router;
