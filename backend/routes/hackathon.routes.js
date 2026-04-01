import express from "express";
import {
  getActiveHackathons,
  getExpiredHackathons,
  getUpcomingHackathons,
  getHackathonById,
  getHackathonResults,
  addGalleryImages,
  deleteGalleryImage,
  getHackathonGallery,
  toggleHackathonWishlist,
  getUserHackathonWishlist,
  checkHackathonLiked,
} from "../controllers/hackathon.controllers.js";
import {
  uploadHackathonImages, 
  uploadGalleryImages
} from "../middlewares/Multerhackathon.js";
import { verifyAuth } from "../middlewares/userAuth.js";
import { adminAuth } from "../middlewares/adminAuth.js";
import rateLimit from "express-rate-limit";

const router = express.Router();

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

router.get("/activeHackathons", getLimiter, getActiveHackathons);
router.get("/expiredHackathons", getLimiter, getExpiredHackathons);
router.get("/upcomingHackathons", getLimiter, getUpcomingHackathons);
router.post("/wishlist/toggle", verifyAuth, getLimiter, toggleHackathonWishlist);
router.get("/wishlist", verifyAuth, getLimiter, getUserHackathonWishlist);
router.get("/wishlist/check/:hackathonId", verifyAuth, getLimiter, checkHackathonLiked);
router.get("/:id", getLimiter, getHackathonById);
router.get("/:id/results", getLimiter, getHackathonResults);
router.get("/:hackathonId/gallery", getLimiter, getHackathonGallery);
router.post("/:hackathonId/gallery", adminAuth, strictLimiter, uploadGalleryImages, addGalleryImages);
router.delete("/:hackathonId/gallery", adminAuth, strictLimiter, deleteGalleryImage);

export default router;