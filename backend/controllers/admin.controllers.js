import mongoose from "mongoose";
import hackathonModel from "../models/hackathon.models.js";
import UserModel from "../models/user.models.js";
import SubmissionModel from "../models/submission.js";
import RegisteredParticipantsModel from "../models/registeredParticipants.js";
import PendingHackathon from "../models/pendingHackathon.model.js";
import Admin from "../models/admin.model.js";
import TeamModel from "../models/team.js";
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import s3Client from "../config/aws.js";
import fs from "fs";
import { sendMail } from "../emailService/brevoEmail.js";

// Get all hackathons created by a specific admin
export const getAllHackathons = async (req, res) => {
  try {
    const { adminId } = req.body;

    if (!adminId) {
      return res.status(400).json({
        success: false,
        message: "Admin ID is required",
      });
    }

    const admin = await Admin.findById(adminId);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    let hackathons;

    if (admin.controller) {
      hackathons = await hackathonModel.find();
    } else {
      hackathons = await hackathonModel.find({ createdBy: adminId });
    }

    return res.status(200).json(hackathons);
  } catch (err) {
    console.error("getAllHackathons error:", err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Get detailed information for a single hackathon created by an admin
export const getMyHackathon = async (req, res) => {
  try {
    const { adminId, hackathonId } = req.body;

    // 1. Fetch the main hackathon document
    const hackathon = await hackathonModel.findOne({
      _id: hackathonId,
      createdBy: adminId,
    });

    if (!hackathon) {
      return res
        .status(404)
        .json({ error: "Hackathon not found or you are not the creator." });
    }

    // 2. Fetch all related data from the database in parallel
    const [participants, teams, submissions] = await Promise.all([
      RegisteredParticipantsModel.find({ hackathon: hackathonId })
        .populate("user", "name email")
        .lean(),
      TeamModel.find({ hackathon: hackathonId })
        .populate("leader", "name email")
        .populate("members", "name email")
        .lean(),
      SubmissionModel.find({ hackathon: hackathonId }).lean(),
    ]);

    // 3. Manually link submissions to their corresponding teams
    const teamsWithSubmissions = teams.map((team) => {
      // For each team, find its submission in the submissions array
      const submission = submissions.find(
        (s) => s.team?.toString() === team._id.toString()
      );
      return {
        ...team,
        submission: submission || null, // Attach the submission object, or null if none exists
      };
    });

    // 4. Manually link submissions to their corresponding individual participants
    const participantsWithSubmissions = participants.map((p) => {
      // For each participant, find their submission in the submissions array
      // Note: We link by the user's ID (p.user._id)
      if (!p.user?._id) {
        return {
          ...p,
          user: { name: "Deleted User", email: "" },
          submission: null,
        };
      }
      const submission = submissions.find(
        (s) => s.participant?.toString() === p.user._id.toString()
      );
      return {
        ...p,
        submission: submission || null, // Attach the submission object, or null if none exists
      };
    });

    // 5. Send the final, combined data to the frontend
    res.json({
      hackathon,
      participantsWithoutTeam: participantsWithSubmissions.filter(
        (p) => !p.team
      ),
      teams: teamsWithSubmissions,
    });
  } catch (err) {
    console.error("Error in getMyHackathon:", err);
    res.status(500).json({ error: err.message });
  }
};

// Get a list of all admins
export const getalladmin = async (req, res) => {
  try {
    const admindetails = await Admin.find().select("-password"); // Exclude passwords
    res.status(200).json({
      admindetails,
    });
  } catch (err) {
    res.status(404).json({
      message: err.message,
    });
  }
};

export const createPendingHackathon = async (req, res) => {
  try {
    let imageUrl = "";

    // ================= IMAGE UPLOAD =================
    if (req.file) {
      try {
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 9);
        const key = `hackathons/images/${timestamp}-${randomString}-${req.file.originalname}`;

        const putObjectCommand = new PutObjectCommand({
          Bucket: process.env.AWS_S3_BUCKET_NAME,
          Key: key,
          Body: fs.createReadStream(req.file.path), // ✅ STREAM (better than readFileSync)
          ContentType: req.file.mimetype,
        });

        await s3Client.send(putObjectCommand);

        imageUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${
          process.env.AWS_REGION || "ap-southeast-2"
        }.amazonaws.com/${key}`;

        // Safe cleanup
        try {
          fs.unlinkSync(req.file.path);
        } catch (e) {
          console.warn("File cleanup failed:", e.message);
        }
      } catch (error) {
        console.error("Error uploading to AWS S3:", error);
        throw new Error(`File upload failed: ${error.message}`);
      }
    }

    // ================= DATA PROCESSING =================
    const data = { ...req.body };

    // 🔥 SAFE JSON PARSER
    Object.keys(data).forEach((key) => {
      if (typeof data[key] === "string") {
        const value = data[key].trim();

        if (
          (value.startsWith("{") && value.endsWith("}")) ||
          (value.startsWith("[") && value.endsWith("]"))
        ) {
          try {
            data[key] = JSON.parse(value);
          } catch (err) {
            console.warn(`Failed to parse JSON field: ${key}`, value);
          }
        }
      }
    });

    // ================= REQUIRED VALIDATION =================
    if (!data.title) {
      return res.status(400).json({
        success: false,
        message: "Title is required",
      });
    }

    if (!data.adminId) {
      return res.status(400).json({
        success: false,
        message: "Admin ID is required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(data.adminId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Admin ID",
      });
    }

    // ================= DATE VALIDATION =================
    const dateFields = [
      "startDate",
      "endDate",
      "submissionStartDate",
      "submissionEndDate",
    ];

    dateFields.forEach((field) => {
      if (data[field]) {
        const parsed = new Date(data[field]);
        if (isNaN(parsed)) {
          throw new Error(`${field} is invalid`);
        }
        data[field] = parsed;
      }
    });

    // ================= FIELD TRANSFORM =================
    data.createdBy = data.adminId;
    delete data.adminId;

    if (imageUrl) {
      data.image = imageUrl;
    }

    // ================= DEFAULT ARRAYS =================
    const defaultArrayFields = [
      "techStackUsed",
      "category",
      "themes",
      "problems",
      "TandCforHackathon",
      "evaluationCriteria",
      "FAQs",
      "projectSubmission",
      "gallery",
      "approvals",
      "rejectedBy",
      "rewards",
    ];

    if (data.refMaterial !== undefined) {
      if (Array.isArray(data.refMaterial)) {
        data.refMaterial = data.refMaterial.filter(Boolean);
      } else if (typeof data.refMaterial === "string") {
        try {
          const parsed = JSON.parse(data.refMaterial);
          if (Array.isArray(parsed)) {
            data.refMaterial = parsed;
          } else {
            data.refMaterial = [data.refMaterial];
          }
        } catch {
          data.refMaterial = [data.refMaterial];
        }
      } else {
        data.refMaterial = [];
      }
    }

    defaultArrayFields.forEach((field) => {
      if (!Array.isArray(data[field])) {
        data[field] = [];
      }
    });

    // ================= SANITIZATION =================

    // ✅ Rewards cleanup
    if (Array.isArray(data.rewards)) {
      data.rewards = data.rewards.filter((r) => r && r.description && r.amount);
    }

    // ✅ Gallery cleanup
    if (Array.isArray(data.gallery)) {
      data.gallery = data.gallery.filter((g) => g && g.public_id && g.url);
    }

    // ✅ FAQs cleanup
    if (Array.isArray(data.FAQs)) {
      data.FAQs = data.FAQs.filter((f) => f && f.question && f.answer);
    }

    // ================= OBJECT DEFAULTS =================

    // ⚠️ Do NOT override schema defaults
    if (data.allowedFileTypes && typeof data.allowedFileTypes !== "object") {
      delete data.allowedFileTypes;
    }

    // ================= SAVE TO DB =================
    const pendingHackathon = new PendingHackathon(data);
    await pendingHackathon.save();

    return res.status(201).json({
      success: true,
      message: "Hackathon created and waiting for approval",
      pendingHackathon,
    });
  } catch (err) {
    console.error("Create Pending Hackathon Error:", err);

    return res.status(400).json({
      success: false,
      error: err.message,
    });
  }
};

// Approve a pending hackathon (controller-only)
export const approveHackathon = async (req, res) => {
  try {
    const { pendingHackathonId, adminId } = req.body;

    const admin = await Admin.findById(adminId);
    if (!admin || !admin.controller) {
      return res.status(403).json({
        success: false,
        message: "Not a controller admin",
      });
    }

    const pending = await PendingHackathon.findById(pendingHackathonId);
    if (!pending) {
      return res.status(404).json({
        success: false,
        message: "Pending hackathon not found",
      });
    }

    if (pending.approvals.includes(adminId)) {
      return res.status(400).json({
        success: false,
        message: "Already approved",
      });
    }

    if (pending.approvalStatus === "rejected") {
      pending.rejectionDetails = {};
      pending.approvalStatus = "pending";
    }

    pending.approvals.push(adminId);
    await pending.save();

    const controllers = await Admin.find({ controller: true }).select("_id");
    const allControllerIds = controllers.map((c) => c._id.toString());
    const approvedIds = pending.approvals.map((a) => a.toString());

    const allApproved = allControllerIds.every((id) =>
      approvedIds.includes(id)
    );

    const hackathonTitle = pending.title;
    const createdBy = pending.createdBy;

    if (allApproved) {
      const pendingData = pending.toObject();

      delete pendingData._id;
      delete pendingData.approvals;
      delete pendingData.rejectionDetails;
      delete pendingData.createdAt;
      delete pendingData.updatedAt;
      delete pendingData.__v;

      if (!pendingData.gallery) {
        pendingData.gallery = [];
      }

      const now = new Date();

      const isActive =
        pendingData.startDate &&
        pendingData.submissionEndDate &&
        pendingData.startDate <= now &&
        pendingData.submissionEndDate >= now;

      pendingData.status = isActive;

      const hackathon = new hackathonModel(pendingData);
      await hackathon.save();

      const hackathonId = hackathon._id.toString();

      await PendingHackathon.findByIdAndDelete(pendingHackathonId);

      setImmediate(async () => {
        try {
          if (pending.createdBy) {
            const creator = await Admin.findById(pending.createdBy);

            if (creator?.email) {
              await sendMail({
                to: creator.email,
                subject: "🎉 Your Hackathon is Approved!",
                templateName: "hackathonApproved",
                data: {
                  name: creator.adminName || "Admin",
                  hackathonName: pending.title,
                  hackathonLink: `${FRONTEND_URL}/hackathon/${hackathonId}`,
                },
              });
            }
          }

          const users = await UserModel.find({
            isVerified: true,
            email: { $exists: true, $ne: null },
          });

          const uniqueUsers = [
            ...new Map(
              users.map((u) => [
                u.email.toLowerCase(),
                { email: u.email, name: u.name },
              ])
            ).values(),
          ];

          const BATCH_SIZE = 50;

          for (let i = 0; i < uniqueUsers.length; i += BATCH_SIZE) {
            const batch = uniqueUsers.slice(i, i + BATCH_SIZE);

            await Promise.all(
              batch.map((user) =>
                sendMail({
                  to: user.email,
                  subject: `New Hackathon Live: ${pending.title}`,
                  templateName: "hackathonLive",
                  data: {
                    name: user.name || "User",
                    hackathonName: pending.title,
                    hackathonLink: `${FRONTEND_URL}/hackathon/${hackathonId}`,
                  },
                })
              )
            );

            await new Promise((res) => setTimeout(res, 500));
          }

          console.log("Hackathon emails sent");
        } catch (err) {
          console.error("Email error:", err);
        }
      });

      return res.status(200).json({
        success: true,
        message: "Hackathon approved and moved to main collection",
        hackathon,
        isActive: isActive
          ? "Hackathon is now live"
          : "Hackathon is upcoming or expired",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Approved. Waiting for other controllers.",
      approvals: pending.approvals.length,
    });
  } catch (err) {
    console.error("Approval error:", err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Reject a pending hackathon (controller-only)
export const rejectHackathon = async (req, res) => {
  try {
    const { pendingHackathonId, adminId, rejectionReason } = req.body;

    const admin = await Admin.findById(adminId);
    if (!admin || !admin.controller) {
      return res.status(403).json({
        success: false,
        message: "Not a controller admin",
      });
    }

    const pending = await PendingHackathon.findById(pendingHackathonId);
    if (!pending) {
      return res.status(404).json({
        success: false,
        message: "Pending hackathon not found",
      });
    }

    if (pending.approvalStatus === "rejected") {
      return res.status(400).json({
        success: false,
        message: "Hackathon already rejected",
      });
    }

    pending.approvalStatus = "rejected";

    pending.rejectionDetails = {
      reason: rejectionReason || "",
      rejectedAt: new Date(),
      rejectedBy: adminId,
    };

    await pending.save();

    const hackathonTitle = pending.title;
    const createdBy = pending.createdBy;
    const reason = rejectionReason || "Please review guidelines and update your submission.";

    setImmediate(async () => {
      try {
        if (createdBy) {
          const creator = await Admin.findById(createdBy);

          if (creator?.email) {
            await sendMail({
              to: creator.email,
              subject: "Hackathon Rejected",
              templateName: "hackathonRejected",
              data: {
                name: creator.adminName || "Admin",
                hackathonName: hackathonTitle,
                reason: reason,
              },
            });
          }
        }

        console.log("Rejection email sent");
      } catch (err) {
        console.error("Email error:", err);
      }
    });

    return res.status(200).json({
      success: true,
      message: "Hackathon rejected successfully",
      rejectionDetails: pending.rejectionDetails,
    });
  } catch (err) {
    console.error("Reject Hackathon Error:", err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Display all pending hackathons
export const displayPendingHackathon = async (req, res) => {
  try {
    const { adminId } = req.params;

    if (!adminId) {
      return res.status(400).json({
        success: false,
        message: "Admin ID is required",
      });
    }

    const admin = await Admin.findById(adminId);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    let pendingHackathonsData;

    if (admin.controller) {
      pendingHackathonsData = await PendingHackathon.find().sort({
        createdAt: -1,
      });
    } else {
      pendingHackathonsData = await PendingHackathon.find({
        createdBy: adminId,
      }).sort({ createdAt: -1 });
    }

    return res.status(200).json({
      pendingHackathonsData,
    });
  } catch (err) {
    console.error("displayPendingHackathon error:", err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const updateHackathonPoint = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    const { adminId, submissionId, points } = req.body;
    if (!adminId) {
      return res
        .status(401)
        .json({ success: false, message: "Not authenticated" });
    }

    if (!submissionId || typeof points !== "number") {
      return res.status(400).json({
        success: false,
        message: "Request body must include submissionId and points (number).",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(submissionId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid submissionId" });
    }

    // Load submission (we'll use session in transaction)
    const submission = await SubmissionModel.findById(submissionId).session(
      session
    );
    if (!submission) {
      return res
        .status(404)
        .json({ success: false, message: "Submission not found" });
    }

    const hackathon = await hackathonModel
      .findById(submission.hackathon)
      .select("createdBy");
    if (!hackathon) {
      return res.status(404).json({
        success: false,
        message: "Hackathon for this submission not found",
      });
    }

    if (hackathon.createdBy.toString() !== adminId.toString()) {
      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to update points for submissions of this hackathon",
      });
    }

    // Start transaction
    session.startTransaction();

    // Update submission's hackathonPoints to the provided points
    const updatedSubmission = await SubmissionModel.findByIdAndUpdate(
      submissionId,
      { $set: { hackathonPoints: points } },
      { new: true, runValidators: true, session }
    );

    // Build list of user ids to update (leader + members OR participant)
    const userIds = [];
    if (submission.team) {
      const team = await TeamModel.findById(submission.team)
        .select("leader members")
        .lean();
      if (team) {
        if (team.leader) userIds.push(team.leader);
        if (Array.isArray(team.members) && team.members.length) {
          userIds.push(...team.members);
        }
      }
    } else if (submission.participant) {
      userIds.push(submission.participant);
    }

    // Dedupe and filter ids
    const uniqueUserIds = [
      ...new Set(userIds.map((id) => id?.toString()).filter(Boolean)),
    ];

    let usersUpdatedCount = 0;
    if (uniqueUserIds.length) {
      // Set each user's hackathonPoints to the incoming points value
      const updateResult = await UserModel.updateMany(
        { _id: { $in: uniqueUserIds } },
        { $set: { hackathonPoints: points } },
        { session }
      );
      usersUpdatedCount =
        updateResult.nModified ?? updateResult.modifiedCount ?? 0;
    }

    // Commit transaction
    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      success: true,
      message: "hackathonPoints updated on submission and users",
      submission: updatedSubmission,
      usersUpdatedCount,
      setToPoints: points,
    });
  } catch (err) {
    try {
      await session.abortTransaction();
    } catch (e) {
      // ignore abort errors
    }
    session.endSession();
    console.error("updateHackathonPoint error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
};

// Get the profile details of the currently logged-in admin
export const getAdminDetails = async (req, res) => {
  try {
    // The admin object is attached to the request by the adminAuth middleware
    const admin = req.admin;

    if (!admin) {
      // This is a safeguard, but adminAuth should have already handled it
      return res
        .status(401)
        .json({ success: false, message: "Not authenticated" });
    }

    return res.status(200).json({
      success: true,
      admin: {
        id: admin._id,
        name: admin.adminName,
        email: admin.email,
        avatar: admin.avatar,
        contactNumber: admin.contactNumber,
        isVerified: admin.isVerified,
        controller: admin.controller,
        lastLogin: admin.lastLogin,
        createdAt: admin.createdAt,
        updatedAt: admin.updatedAt,
      },
    });
  } catch (err) {
    console.error("getAdminDetails error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const editHackathon = async (req, res) => {
  try {
    // ── 1. Validate IDs ──────────────────────────────────────────────────────
    const { hackathonId, adminId } = req.body;

    if (!hackathonId || !mongoose.Types.ObjectId.isValid(hackathonId)) {
      return res
        .status(400)
        .json({ success: false, message: "Valid hackathonId is required." });
    }
    if (!adminId || !mongoose.Types.ObjectId.isValid(adminId)) {
      return res
        .status(400)
        .json({ success: false, message: "Valid adminId is required." });
    }

    // ── 2. Find hackathon and verify ownership ───────────────────────────────
    const hackathon = await hackathonModel.findById(hackathonId);
    if (!hackathon) {
      return res
        .status(404)
        .json({ success: false, message: "Hackathon not found." });
    }
    if (hackathon.createdBy.toString() !== adminId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not the creator of this hackathon.",
      });
    }

    // ── 3. Parse incoming data ───────────────────────────────────────────────
    const data = { ...req.body };

    // Safe-parse any JSON-stringified fields
    Object.keys(data).forEach((key) => {
      if (typeof data[key] === "string") {
        const v = data[key].trim();
        if (
          (v.startsWith("{") && v.endsWith("}")) ||
          (v.startsWith("[") && v.endsWith("]"))
        ) {
          try {
            data[key] = JSON.parse(v);
          } catch {}
        }
      }
    });

    if (data.refMaterial !== undefined) {
      if (Array.isArray(data.refMaterial)) {
        data.refMaterial = data.refMaterial.filter(Boolean);
      } else if (typeof data.refMaterial === "string") {
        data.refMaterial = [data.refMaterial];
      } else {
        data.refMaterial = [];
      }
    }
    // Remove fields that must never be overwritten via this route
    const PROTECTED = [
      "hackathonId",
      "adminId",
      "createdBy",
      "gallery",
      "approvals",
      "rejectedBy",
      "rejectionDetails",
      "approvalStatus",
      "__v",
    ];
    PROTECTED.forEach((f) => delete data[f]);

    // Safe-parse any JSON-stringified fields (arrays / objects from FormData)
    Object.keys(data).forEach((key) => {
      if (typeof data[key] === "string") {
        const v = data[key].trim();
        if (
          (v.startsWith("{") && v.endsWith("}")) ||
          (v.startsWith("[") && v.endsWith("]"))
        ) {
          try {
            data[key] = JSON.parse(v);
          } catch {
            console.warn(
              `editHackathon: could not parse field "${key}" as JSON — keeping as string`
            );
          }
        }
      }
    });

    // ── 4. Date validation ───────────────────────────────────────────────────
    const DATE_FIELDS = [
      "startDate",
      "endDate",
      "submissionStartDate",
      "submissionEndDate",
    ];
    for (const field of DATE_FIELDS) {
      if (data[field] !== undefined) {
        const parsed = new Date(data[field]);
        if (isNaN(parsed.getTime())) {
          return res.status(400).json({
            success: false,
            message: `Invalid date value for "${field}".`,
          });
        }
        data[field] = parsed;
      }
    }

    // ── 5. Sanitise arrays ───────────────────────────────────────────────────
    if (Array.isArray(data.rewards)) {
      data.rewards = data.rewards.filter(
        (r) => r && r.description && r.amount > 0
      );
    }
    if (Array.isArray(data.FAQs)) {
      data.FAQs = data.FAQs.filter((f) => f && f.question && f.answer);
    }
    // allowedFileTypes — don't override schema defaults if it's not a valid object
    if (data.allowedFileTypes && typeof data.allowedFileTypes !== "object") {
      delete data.allowedFileTypes;
    }

    // ── 6. Handle image replacement ──────────────────────────────────────────
    if (req.file) {
      try {
        // Upload new image to S3
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(2, 9);
        const key = `hackathons/images/${timestamp}-${randomStr}-${req.file.originalname}`;

        const putCmd = new PutObjectCommand({
          Bucket: process.env.AWS_S3_BUCKET_NAME,
          Key: key,
          Body: fs.createReadStream(req.file.path),
          ContentType: req.file.mimetype,
        });
        await s3Client.send(putCmd);

        data.image = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${
          process.env.AWS_REGION || "ap-southeast-2"
        }.amazonaws.com/${key}`;

        // Delete old image from S3 if it exists and was stored on our bucket
        if (
          hackathon.image &&
          hackathon.image.includes(process.env.AWS_S3_BUCKET_NAME)
        ) {
          try {
            const oldKey = hackathon.image.split(".amazonaws.com/")[1];
            if (oldKey) {
              await s3Client.send(
                new DeleteObjectCommand({
                  Bucket: process.env.AWS_S3_BUCKET_NAME,
                  Key: oldKey,
                })
              );
            }
          } catch (delErr) {
            // Non-fatal — log but continue
            console.warn(
              "editHackathon: could not delete old S3 image:",
              delErr.message
            );
          }
        }

        // Clean up temp file
        try {
          fs.unlinkSync(req.file.path);
        } catch {
          /* ignore */
        }
      } catch (uploadErr) {
        console.error("editHackathon: S3 upload failed:", uploadErr);
        return res.status(500).json({
          success: false,
          message: `Image upload failed: ${uploadErr.message}`,
        });
      }
    }

    // ── 7. Recompute `status` if dates changed ───────────────────────────────
    if (data.startDate || data.submissionEndDate) {
      const start = data.startDate
        ? new Date(data.startDate)
        : hackathon.startDate;
      const subEnd = data.submissionEndDate
        ? new Date(data.submissionEndDate)
        : hackathon.submissionEndDate;
      const now = new Date();
      data.status = !!(start && subEnd && start <= now && subEnd >= now);
    }

    // ── 8. Apply update ──────────────────────────────────────────────────────
    const updated = await hackathonModel.findByIdAndUpdate(
      hackathonId,
      { $set: data },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: "Hackathon updated successfully.",
      hackathon: updated,
    });
  } catch (err) {
    console.error("editHackathon error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteHackathon = async (req, res) => {
  try {
    const { hackathonId, adminId } = req.body;

    // ── Validate IDs ─────────────────────────────────────
    if (!hackathonId || !mongoose.Types.ObjectId.isValid(hackathonId)) {
      return res.status(400).json({
        success: false,
        message: "Valid hackathonId required",
      });
    }

    if (!adminId || !mongoose.Types.ObjectId.isValid(adminId)) {
      return res.status(400).json({
        success: false,
        message: "Valid adminId required",
      });
    }

    // ── Fetch admin ─────────────────────────────────────
    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    // ── Fetch hackathon ─────────────────────────────────
    const hackathon = await hackathonModel.findById(hackathonId);
    if (!hackathon) {
      return res.status(404).json({
        success: false,
        message: "Hackathon not found",
      });
    }

    // ── Authorization logic 🔥 ──────────────────────────
    const isCreator = hackathon.createdBy.toString() === adminId.toString();

    if (!admin.controller && !isCreator) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this hackathon",
      });
    }

    // ── Delete banner image from S3 (if exists) ─────────
    if (hackathon.image?.includes(process.env.AWS_S3_BUCKET_NAME)) {
      try {
        const key = hackathon.image.split(".amazonaws.com/")[1];
        if (key) {
          await s3Client.send(
            new DeleteObjectCommand({
              Bucket: process.env.AWS_S3_BUCKET_NAME,
              Key: key,
            })
          );
        }
      } catch (err) {
        console.warn("S3 image delete failed:", err.message);
      }
    }

    // ── Delete gallery images (optional but good) ───────
    if (Array.isArray(hackathon.gallery)) {
      for (const url of hackathon.gallery) {
        try {
          const key = url.split(".amazonaws.com/")[1];
          if (key) {
            await s3Client.send(
              new DeleteObjectCommand({
                Bucket: process.env.AWS_S3_BUCKET_NAME,
                Key: key,
              })
            );
          }
        } catch (err) {
          console.warn("Gallery image delete failed:", err.message);
        }
      }
    }

    // ── Delete hackathon ───────────────────────────────
    await hackathonModel.findByIdAndDelete(hackathonId);

    return res.status(200).json({
      success: true,
      message: "Hackathon deleted successfully",
    });
  } catch (err) {
    console.error("deleteHackathon error:", err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
