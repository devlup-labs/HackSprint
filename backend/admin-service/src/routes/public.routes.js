import express from "express";
import rateLimit from "express-rate-limit";
import { submitContact, submitFeedback } from "../controllers/contact.controller.js";

const router = express.Router();

// Public Contact page form — anyone can send one, so it has its own tight limit.
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 8,
  handler: (req, res) => {
    res.status(429).json({ success: false, message: "Too many messages from this connection. Please try again later." });
  },
});

router.post("/contact", contactLimiter, submitContact);
router.post("/feedback", contactLimiter, submitFeedback);

export default router;
