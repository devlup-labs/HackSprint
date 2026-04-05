import express from "express";
import {
  toggleVote,
  getHackathonVotes,
  getUserVotes,
  getSubmissionVoteCount,
} from "../controllers/vote.controllers.js";
import { verifyAuth } from "../middlewares/userAuth.js";
import { adminAuth } from "../middlewares/adminAuth.js";

const router = express.Router();

router.post("/toggle", verifyAuth, toggleVote);
router.get("/hackathon/:hackathonId", getHackathonVotes);
router.get("/user/:hackathonId", verifyAuth, getUserVotes);
router.get("/submission/:submissionId", getSubmissionVoteCount);

export default router;
