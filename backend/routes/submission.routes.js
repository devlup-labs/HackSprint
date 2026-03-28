import express from "express";
import { submitHackathonSolution, getSubmissionStatus, getSubmissionById, getSubmissionsByHackathon, updateSubmission } from "../controllers/submission.controllers.js";
import upload from "../middlewares/multer.js";
import rateLimit from "express-rate-limit";
import { verifyAuth } from "../middlewares/userAuth.js";

const router = express.Router();

const submitLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: {
    message: "Too many submissions. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post( "/",
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
router.get("/status", verifyAuth, getSubmissionStatus);
router.get("/getSubmissionById/:id", getSubmissionById);
router.get("/hackathon/:hackathonId", getSubmissionsByHackathon);

export default router;
