import express from "express";
import {
  submitHackathonSolution,
  getSubmissionStatus,
  getSubmissionById,
  getSubmissionsByHackathon,
  updateSubmission,
} from "../controllers/submission.controllers.js";
import upload from "../middlewares/multer.js";
import rateLimit from "express-rate-limit";
import { verifyAuth } from "../middlewares/userAuth.js";

const router = express.Router();

const submitLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: "Too many requests, please try again later.",
    });
  }
});

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

router.post(
  "/",
  verifyAuth,
  submitLimiter,
  upload.fields([
    { name: "docs", maxCount: 5 },
    { name: "images", maxCount: 5 },
    { name: "videos", maxCount: 2 },
  ]),
  submitHackathonSolution
);
router.put(
  "/:id",
  verifyAuth,
  submitLimiter,
  upload.fields([
    { name: "docs", maxCount: 5 },
    { name: "images", maxCount: 5 },
    { name: "videos", maxCount: 2 },
  ]),
  updateSubmission
);
router.get("/status", verifyAuth, getLimiter, getSubmissionStatus);
router.get("/getSubmissionById/:id", getLimiter, getSubmissionById);
router.get("/hackathon/:hackathonId", getLimiter, getSubmissionsByHackathon);

export default router;
