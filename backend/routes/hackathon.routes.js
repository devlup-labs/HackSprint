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

const router = express.Router();

router.get("/activeHackathons", getActiveHackathons);
router.get("/expiredHackathons", getExpiredHackathons);
router.get("/upcomingHackathons", getUpcomingHackathons);
router.post("/wishlist/toggle", verifyAuth, toggleHackathonWishlist);
router.get("/wishlist", verifyAuth, getUserHackathonWishlist);
router.get("/wishlist/check/:hackathonId", verifyAuth, checkHackathonLiked);
router.get("/:id", getHackathonById);
router.get("/:id/results", getHackathonResults);
router.get("/:hackathonId/gallery", getHackathonGallery);
router.post("/:hackathonId/gallery", adminAuth, uploadGalleryImages, addGalleryImages);
router.delete("/:hackathonId/gallery", adminAuth, deleteGalleryImage);

export default router;