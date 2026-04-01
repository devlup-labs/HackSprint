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

const adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: "Too many login attempts. Try again later.",
});

const googleLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: "Too many Google login attempts. Try again later.",
});

const getLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 700,
  message: "Too many requests, please try again later.",
});

const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many attempts, Please try again later.",
});

// router.get("/", adminAuth, getalladmin);
// router.post("/signup", adminSignup);
// router.post("/login", adminLoginLimiter, adminLogin);
router.get("/google", googleLimiter, adminGoogleLogin);
router.get("/adminDetails", adminAuth, getLimiter, getAdminDetails);
router.get("/my-hackathons", adminAuth, getLimiter, getAllHackathons);
router.post("/my-hackathon-detail", adminAuth, getLimiter, getMyHackathon);
router.post(
  "/createHackathon",
  adminAuth,
  strictLimiter,
  upload.single("image"),
  createPendingHackathon
);
router.post("/approveHackathon", adminAuth, strictLimiter, approveHackathon);
router.post("/rejectHackathon", adminAuth, strictLimiter, rejectHackathon);
router.get("/pendingHackathon", adminAuth, strictLimiter, displayPendingHackathon);
router.post("/HackathonPoints", adminAuth, strictLimiter, updateHackathonPoint);
router.post("/editHackathon", adminAuth, strictLimiter, upload.single("image"), editHackathon);
router.delete("/deleteHackathon", adminAuth, strictLimiter, deleteHackathon);
export default router;
