import express from "express";
import { adminAuth } from "../middlewares/adminAuth.js";

import {
  assignJudge,
  getHackathonJudges,
  removeJudge,
  getAssignedHackathons,
  getMyJudgeInvitations,
  acceptJudgeInvitation,
  declineJudgeInvitation,
} from "../controllers/judgeAssignment.controller.js";

import { reviewSubmission } from "../controllers/submissionReview.controller.js";

const router = express.Router();

router.post("/hackathons/:hackathonId/judges", adminAuth, assignJudge);
router.get("/hackathons/:hackathonId/judges", adminAuth, getHackathonJudges);
router.delete(
  "/hackathons/:hackathonId/judges/:judgeId",
  adminAuth,
  removeJudge
);
router.get("/judges/assigned-hackathons", adminAuth, getAssignedHackathons);
router.get("/judges/invitations", adminAuth, getMyJudgeInvitations);
router.post("/judges/invitations/:invitationId/accept", adminAuth, acceptJudgeInvitation);
router.post("/judges/invitations/:invitationId/decline", adminAuth, declineJudgeInvitation);

router.post(
  "/judges/submissions/:submissionId/review",
  adminAuth,
  reviewSubmission
);


export default router;
