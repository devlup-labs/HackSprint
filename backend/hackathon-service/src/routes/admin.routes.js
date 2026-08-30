import express from "express";
import { adminAuth } from "../middlewares/adminAuth.js";

import {
  assignJudge,
  getHackathonJudges,
  removeJudge,
  getAssignedHackathons,
} from "../controllers/judgeAssignment.controller.js";

import { reviewSubmission } from "../controllers/submissionReview.controller.js";

import {
  getProfile,
  updateProfile,
  submitVerificationRequest,
  getPendingVerificationRequests,
  approveVerification,
  rejectVerification,
  getAllAdmins,
  deleteAdmin,
  lookupAdminByEmail,
} from "../controllers/admin.controller.js";

const router = express.Router();

router.post("/hackathons/:hackathonId/judges", adminAuth, assignJudge);
router.get("/hackathons/:hackathonId/judges", adminAuth, getHackathonJudges);
router.delete(
  "/hackathons/:hackathonId/judges/:judgeId",
  adminAuth,
  removeJudge
);
router.get("/judges/assigned-hackathons", adminAuth, getAssignedHackathons);

router.post(
  "/judges/submissions/:submissionId/review",
  adminAuth,
  reviewSubmission
);

router.get("/profile", adminAuth, getProfile);
router.patch("/profile", adminAuth, updateProfile);
router.post("/verification-request", adminAuth, submitVerificationRequest);
router.get("/verification-requests", adminAuth, getPendingVerificationRequests);
router.get("/admins/lookup", adminAuth, lookupAdminByEmail);
router.get("/admins", adminAuth, getAllAdmins);
router.post("/admins/:adminId/approve", adminAuth, approveVerification);
router.post("/admins/:adminId/reject", adminAuth, rejectVerification);
router.delete("/admins/:adminId", adminAuth, deleteAdmin);

export default router;
