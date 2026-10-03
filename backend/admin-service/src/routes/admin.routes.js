import express from "express";
import { adminAuth } from "../middlewares/adminAuth.js";
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
  searchPlatformUsers,
  deletePlatformUser,
} from "../controllers/admin.controller.js";
import { listEnquiries, updateEnquiry } from "../controllers/contact.controller.js";

const router = express.Router();

router.get("/profile", adminAuth, getProfile);
router.patch("/profile", adminAuth, updateProfile);
router.post("/verification-request", adminAuth, submitVerificationRequest);
router.get("/verification-requests", adminAuth, getPendingVerificationRequests);
router.get("/admins/lookup", adminAuth, lookupAdminByEmail);
router.get("/admins", adminAuth, getAllAdmins);
router.post("/admins/:adminId/approve", adminAuth, approveVerification);
router.post("/admins/:adminId/reject", adminAuth, rejectVerification);
router.delete("/admins/:adminId", adminAuth, deleteAdmin);
router.get("/enquiries", adminAuth, listEnquiries);
router.patch("/enquiries/:enquiryId", adminAuth, updateEnquiry);
router.get("/users", adminAuth, searchPlatformUsers);
router.delete("/users/:userId", adminAuth, deletePlatformUser);

export default router;
