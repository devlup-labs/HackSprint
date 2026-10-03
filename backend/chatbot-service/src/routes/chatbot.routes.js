import express from "express";
import rateLimit from "express-rate-limit";
import { chat, chatStream } from "../controllers/chatbot.controller.js";

const router = express.Router();

// Tighter than the gateway's general limiter — each request is a real,
// billed call to the Gemini API, not a free DB read.
const chatLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return res.status(429).json({
      success: false,
      message: "Too many messages, please slow down.",
    });
  },
});

router.post("/chat", chatLimiter, chat);
router.post("/chat/stream", chatLimiter, chatStream);

export default router;
