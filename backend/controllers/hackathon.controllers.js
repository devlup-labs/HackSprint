// controllers/hackathon.controller.js
import hackathonModel from "../models/hackathon.models.js";
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import s3Client from "../config/aws.js";
import SubmissionModel from "../models/submission.js";
import UserModel from "../models/user.models.js";
import fs from "fs";
import { getNowUTC } from "../utils/dateUtils.js";

// --- GET ACTIVE HACKATHONS ---
// Finds hackathons where the current date (UTC) is between the start and end dates.
export const getActiveHackathons = async (req, res) => {
  try {
    const now = getNowUTC(); // ✅ Always use UTC
    const allHackathons = await hackathonModel
      .find({
        startDate: { $lte: now },
        submissionEndDate: { $gte: now },
      })
      .sort({ endDate: 1 }); // Sort by ending soonest

    res.status(200).json({ allHackathons });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching active hackathons",
      error: error.message,
    });
  }
};

// ─── Helper: upload a single file to S3 and clean up temp ────────────────────
const uploadFileToS3 = async (file, s3KeyPrefix) => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 9);
  const key = `${s3KeyPrefix}/${timestamp}-${randomString}-${file.originalname}`;

  const putObjectCommand = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: key,
    Body: fs.readFileSync(file.path),
    ContentType: file.mimetype,
  });

  await s3Client.send(putObjectCommand);

  // Clean up temp file
  if (fs.existsSync(file.path)) fs.unlinkSync(file.path);

  const url = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
  return { key, url };
};

// ─── Helper: parse JSON-stringified array fields from FormData ────────────────
const parseArrayFields = (body) => {
  const arrayFields = [
    "category",
    "techStackUsed",
    "themes",
    "FAQs",
    "problems",
    "TandCforHackathon",
    "evaluationCriteria",
    "projectSubmission",
    "teams",
    "registeredParticipants",
    "rewards",
  ];

  const parsed = { ...body };
  arrayFields.forEach((field) => {
    if (parsed[field] && typeof parsed[field] === "string") {
      try {
        parsed[field] = JSON.parse(parsed[field]);
      } catch {
        parsed[field] = [];
      }
    }
  });
  return parsed;
};

export const getExpiredHackathons = async (req, res) => {
  try {
    const now = getNowUTC(); // ✅ Always use UTC
    const expiredHackathons = await hackathonModel.find({
      status: false,
      submissionEndDate: { $lt: now },
    });
    res.status(200).json({ expiredHackathons });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching expired hackathons",
      error: error.message,
    });
  }
};

// --- GET UPCOMING HACKATHONS ---
// Finds hackathons where the start date is in the future (UTC).
export const getUpcomingHackathons = async (req, res) => {
  try {
    const now = getNowUTC(); // ✅ Always use UTC
    const upcomingHackathons = await hackathonModel
      .find({
        startDate: { $gt: now },
      })
      .sort({ startDate: 1 }); // Sort by starting soonest

    res.status(200).json({ upcomingHackathons });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching upcoming hackathons",
      error: error.message,
    });
  }
};

// --- GET HACKATHON BY ID ---
export const getHackathonById = async (req, res) => {
  try {
    const hackathon = await hackathonModel.findById(req.params.id);
    if (!hackathon)
      return res.status(404).json({ message: "Hackathon not found" });
    return res.json(hackathon);
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};

// --- GET HACKATHON RESULTS ---
export const getHackathonResults = async (req, res) => {
  try {
    const { id } = req.params;

    const hackathon = await hackathonModel.findById(id);
    if (!hackathon) {
      return res.status(404).json({ message: "Hackathon not found" });
    }

    if (!hackathon.showResult) {
      return res
        .status(403)
        .json({ message: "Results are not public for this hackathon." });
    }

    const results = await SubmissionModel.find({ hackathon: id })
      .sort({ hackathonPoints: -1 })
      .limit(10)
      .populate("participant", "name avatar email")
      .populate("team", "name members");

    res.status(200).json(results);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching results", error: error.message });
  }
};

// --- ADD IMAGES TO GALLERY (separate endpoint for post-creation uploads) ---
// Expects multer.array("image", 10)
export const addGalleryImages = async (req, res) => {
  try {
    const { hackathonId } = req.params;

    const hackathon = await hackathonModel.findById(hackathonId);

    if (!hackathon) {
      return res.status(404).json({ message: "Hackathon not found" });
    }

    if (
      !req.admin?.controller &&
      hackathon.createdBy.toString() !== req.admin._id.toString()
    ) {
      return res.status(403).json({
        message: "You are not allowed to modify this hackathon",
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No images provided" });
    }

    if (hackathon.gallery.length + req.files.length > 30) {
      return res.status(400).json({
        message: "Max 30 images allowed in gallery",
      });
    }

    const validTypes = ["image/jpeg", "image/png", "image/webp"];

    const uploadPromises = req.files.map(async (file) => {
      if (!validTypes.includes(file.mimetype)) {
        throw new Error(`Invalid file type: ${file.originalname}`);
      }

      const { url } = await uploadFileToS3(
        file,
        `hackathons/${hackathonId}/gallery`
      );

      try {
        fs.unlinkSync(file.path);
      } catch (e) {
        console.warn("File cleanup failed:", e.message);
      }

      return url;
    });

    const newImageUrls = await Promise.all(uploadPromises);

    hackathon.gallery.push(...newImageUrls);
    await hackathon.save();

    res.status(200).json({
      message: "Images added to gallery successfully",
      gallery: hackathon.gallery,
    });
  } catch (error) {
    console.error("Add gallery images error:", error);
    res.status(500).json({
      message: "Error adding images to gallery",
      error: error.message,
    });
  }
};

// --- DELETE IMAGE FROM GALLERY ---
export const deleteGalleryImage = async (req, res) => {
  try {
    const { hackathonId } = req.params;
    const { imageUrl } = req.body;

    const hackathon = await hackathonModel.findById(hackathonId);
    if (!hackathon) {
      return res.status(404).json({ message: "Hackathon not found" });
    }

    if (
      !req.admin?.controller &&
      hackathon.createdBy.toString() !== req.admin._id.toString()
    ) {
      return res.status(403).json({
        message: "You are not allowed to modify this hackathon",
      });
    }

    const imageIndex = hackathon.gallery.indexOf(imageUrl);

    if (imageIndex === -1) {
      return res.status(404).json({ message: "Image not found in gallery" });
    }

    // ✅ Delete from S3
    try {
      const urlParts = new URL(imageUrl);
      const s3Key = urlParts.pathname.substring(1);

      await s3Client.send(
        new DeleteObjectCommand({
          Bucket: process.env.AWS_S3_BUCKET_NAME,
          Key: s3Key,
        })
      );
    } catch (s3Error) {
      console.warn("S3 deletion failed:", s3Error.message);
    }

    hackathon.gallery.splice(imageIndex, 1);
    await hackathon.save();

    res.status(200).json({
      message: "Image deleted successfully",
      gallery: hackathon.gallery,
    });
  } catch (error) {
    console.error("Delete gallery image error:", error);
    res.status(500).json({
      message: "Error deleting image from gallery",
      error: error.message,
    });
  }
};

// --- GET HACKATHON GALLERY ---
export const getHackathonGallery = async (req, res) => {
  try {
    const { hackathonId } = req.params;
    const hackathon = await hackathonModel
      .findById(hackathonId)
      .select("gallery");
    if (!hackathon)
      return res.status(404).json({ message: "Hackathon not found" });
    res.status(200).json({ success: true, gallery: hackathon.gallery || [] });
  } catch (error) {
    console.error("Get gallery error:", error);
    res
      .status(500)
      .json({ message: "Error fetching gallery", error: error.message });
  }
};

// --- TOGGLE HACKATHON WISHLIST ---
export const toggleHackathonWishlist = async (req, res) => {
  try {
    const { hackathonId } = req.body;
    const userId = req.user._id; // Try req.userId first

    if (!hackathonId)
      return res
        .status(400)
        .json({ message: "Hackathon ID is required", success: false });
    if (!userId)
      return res
        .status(401)
        .json({ message: "User not authenticated", success: false });

    const hackathon = await hackathonModel.findById(hackathonId);
    if (!hackathon)
      return res
        .status(404)
        .json({ message: "Hackathon not found", success: false });

    const user = await UserModel.findById(userId);
    if (!user)
      return res
        .status(404)
        .json({ message: "User not found", success: false });

    const wishlistIndex = user.wishlist.indexOf(hackathonId);
    if (wishlistIndex > -1) {
      user.wishlist.splice(wishlistIndex, 1);
      await user.save();
      return res.status(200).json({
        message: "Removed from wishlist",
        success: true,
        liked: false,
      });
    } else {
      user.wishlist.push(hackathonId);
      await user.save();
      return res
        .status(201)
        .json({ message: "Added to wishlist", success: true, liked: true });
    }
  } catch (error) {
    console.error("Toggle hackathon wishlist error:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
      error: error.message,
    });
  }
};

// --- GET USER WISHLIST ---
export const getUserHackathonWishlist = async (req, res) => {
  try {
    const userId = req.user._id; // Try req.userId first

    if (!userId) {
      return res.status(401).json({
        message: "User not authenticated",
        success: false,
      });
    }

    const user = await UserModel.findById(userId).populate({
      path: "wishlist",
      select:
        "title subTitle description image startDate endDate submissionStartDate submissionEndDate prizeMoney difficulty category techStackUsed themes status",
    });

    if (!user)
      return res
        .status(404)
        .json({ message: "User not found", success: false });

    const likedHackathons = user.wishlist.filter((h) => h !== null);
    return res
      .status(200)
      .json({ success: true, likedHackathons, count: likedHackathons.length });
  } catch (error) {
    console.error("Get user hackathon wishlist error:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
      error: error.message,
    });
  }
};

// --- CHECK IF HACKATHON IS LIKED ---
export const checkHackathonLiked = async (req, res) => {
  try {
    const { hackathonId } = req.params;
    const userId = req.user._id; // Try req.userId first, fallback to req.body.userId

    if (!userId) {
      return res.status(401).json({
        message: "User not authenticated",
        success: false,
      });
    }

    const user = await UserModel.findById(userId);
    if (!user)
      return res
        .status(404)
        .json({ message: "User not found", success: false });

    return res
      .status(200)
      .json({ success: true, liked: user.wishlist.includes(hackathonId) });
  } catch (error) {
    console.error("Check hackathon liked error:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
      error: error.message,
    });
  }
};
