import express from "express";
import RegisteredParticipantsModel from "../models/registeredParticipants.js";
import {
  isregistered,
  registerParicipants,
  registerTeam,
} from "../controllers/registration.controllers.js";
import { verifyAuth } from "../middlewares/userAuth.js";
import rateLimit from "express-rate-limit";

const router = express.Router();

const getLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 700,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: "Too many requests, please try again later.",
    });
  },
});

export const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: "Too many requests, please try again later.",
    });
  },
});

// router.post("/:hackathonId", verifyAuth, strictLimiter, registerParicipants);
// router.post("/:hackathonId/team" ,  verifyAuth, registerTeam);
router.get("/:hackathonId/:userId", verifyAuth, getLimiter, isregistered);
export default router;
