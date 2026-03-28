import express from "express";
import {
  getMyHackathon,
  deleteHackathon,
  editHackathon,
  getAllHackathons,
  getalladmin,
  createPendingHackathon,
  approveHackathon,
  rejectHackathon,
  displayPendingHackathon,
  updateHackathonPoint,
  getAdminDetails,
} from "../controllers/admin.controllers.js";
import upload from "../middlewares/multer1.js";
import { adminAuth } from "../middlewares/adminAuth.js";
import {
  adminLogin,
  adminSignup,
  adminGoogleLogin,
} from "../controllers/adminAuth.controllers.js";
import rateLimit from "express-rate-limit";

const router = express.Router();

export const adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: "Too many login attempts. Try again later.",
});

export const googleLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: "Too many Google login attempts. Try again later.",
});

router.get("/", adminAuth, getalladmin);
// router.post("/signup", adminSignup);
// router.post("/login", adminLoginLimiter, adminLogin);
router.get("/google", googleLimiter, adminGoogleLogin);
router.get("/adminDetails", adminAuth, getAdminDetails);
router.get("/my-hackathons", adminAuth, getAllHackathons);
router.post("/my-hackathon-detail", adminAuth, getMyHackathon);
router.post(
  "/createHackathon",
  adminAuth,
  upload.single("image"),
  createPendingHackathon
);
router.post("/approveHackathon", adminAuth, approveHackathon);
router.post("/rejectHackathon", adminAuth, rejectHackathon);
router.get("/pendingHackathon", adminAuth, displayPendingHackathon);
router.post("/HackathonPoints", adminAuth, updateHackathonPoint);
router.post("/editHackathon", adminAuth, upload.single("image"), editHackathon);
router.delete("/deleteHackathon", adminAuth, deleteHackathon);
export default router;
