import mongoose from "mongoose";
import "../../models/user.model.js";
import "../../models/team.model.js";
import "../../models/registeredParticipants.model.js";
import "../../models/submission.models.js";
import "../../models/submissionVote.model.js";
import "../../models/submissionReview.model.js";
import "../../models/discussion.model.js";
import { BadRequestError } from "../../errors/BadRequestError.js";
import { ForbiddenError } from "../../errors/ForbiddenError.js";
import { NotFoundError } from "../../errors/NotFoundError.js";

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Platform-wide user moderation, for controllers only: find an account and,
// when it's abusive or bogus, remove it together with everything it owns so
// nothing is left pointing at a user that no longer exists.
export class PlatformUserService {
  constructor(adminRepository, logger) {
    this.adminRepository = adminRepository;
    this.logger = logger;
  }

  async ensureController(adminId) {
    const admin = await this.adminRepository.getById(adminId);
    if (!admin || !admin.controller) throw new ForbiddenError("Unauthorized");
    return admin;
  }

  async searchUsers(controllerId, { q, page = 1, limit = 15 }) {
    await this.ensureController(controllerId);
    const User = mongoose.model("users");
    const term = typeof q === "string" ? q.trim().slice(0, 80) : "";
    const filter = {};
    if (term) {
      const rx = { $regex: escapeRegex(term.replace(/^@/, "")), $options: "i" };
      filter.$or = [{ name: rx }, { userName: rx }, { email: rx }];
    }
    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 15, 1), 50);

    const [users, total] = await Promise.all([
      User.find(filter)
        .select("name userName email image provider createdAt")
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
      User.countDocuments(filter),
    ]);

    const ids = users.map((u) => u._id);
    const regs = await mongoose.model("registeredParticipants").aggregate([
      { $match: { user: { $in: ids } } },
      { $group: { _id: "$user", n: { $sum: 1 } } },
    ]);
    const counts = new Map(regs.map((r) => [String(r._id), r.n]));

    return {
      users: users.map((u) => ({ ...u, registrations: counts.get(String(u._id)) || 0 })),
      pagination: { page: pageNum, limit: limitNum, total, hasNext: pageNum * limitNum < total },
    };
  }

  async deleteUser(controllerId, userId, { confirmEmail, reason } = {}) {
    await this.ensureController(controllerId);
    if (!mongoose.Types.ObjectId.isValid(userId)) throw new BadRequestError("Invalid user id");

    const User = mongoose.model("users");
    const user = await User.findById(userId).select("email name role").lean();
    if (!user) throw new NotFoundError("User not found");

    // The controller has to type the email, so a mis-click can't wipe someone.
    if (!confirmEmail || String(confirmEmail).trim().toLowerCase() !== user.email) {
      throw new BadRequestError("Type the user's email exactly to confirm");
    }
    const why = typeof reason === "string" ? reason.trim().slice(0, 500) : "";
    if (why.length < 5) throw new BadRequestError("Give a short reason for the removal");

    const oid = new mongoose.Types.ObjectId(userId);
    const Team = mongoose.model("teams");
    const Reg = mongoose.model("registeredParticipants");
    const Submission = mongoose.model("submissions");
    const Vote = mongoose.model("SubmissionVote");
    const Review = mongoose.model("submissionReviews");
    const Discussion = mongoose.model("discussions");

    const summary = { teamsDisbanded: 0, teamsHandedOver: 0, submissionsRemoved: 0 };

    // Teams this person leads: hand the team to a member, or disband it if
    // nobody else is in it (along with its submission).
    for (const team of await Team.find({ leader: oid })) {
      if (team.members.length > 0) {
        const [next, ...rest] = team.members;
        team.leader = next;
        team.members = rest;
        await team.save();
        summary.teamsHandedOver += 1;
      } else {
        const subs = await Submission.find({ team: team._id }).select("_id").lean();
        const subIds = subs.map((s) => s._id);
        if (subIds.length) {
          await Promise.all([Vote.deleteMany({ submission: { $in: subIds } }), Review.deleteMany({ submission: { $in: subIds } }), Submission.deleteMany({ _id: { $in: subIds } })]);
          summary.submissionsRemoved += subIds.length;
        }
        await Reg.updateMany({ team: team._id }, { $set: { team: null } });
        await Team.deleteOne({ _id: team._id });
        summary.teamsDisbanded += 1;
      }
    }

    await Team.updateMany({ members: oid }, { $pull: { members: oid } });
    await Team.updateMany({ pendingMembers: oid }, { $pull: { pendingMembers: oid } });

    const solo = await Submission.find({ participant: oid }).select("_id").lean();
    if (solo.length) {
      const ids = solo.map((s) => s._id);
      await Promise.all([Vote.deleteMany({ submission: { $in: ids } }), Review.deleteMany({ submission: { $in: ids } }), Submission.deleteMany({ _id: { $in: ids } })]);
      summary.submissionsRemoved += ids.length;
    }

    await Promise.all([
      Reg.deleteMany({ user: oid }),
      Vote.deleteMany({ voter: oid }),
      Discussion.deleteMany({ sender: oid }),
      // Collections owned by the auth service live in the same database.
      mongoose.connection.collection("contactrequests").deleteMany({ $or: [{ sender: oid }, { recipient: oid }] }),
      mongoose.connection.collection("directmessages").deleteMany({ $or: [{ sender: oid }, { recipient: oid }] }),
      mongoose.connection.collection("dailyattempts").deleteMany({ userId: oid }),
    ]);

    await User.deleteOne({ _id: oid });

    this.logger.warn({ controllerId, deletedUserId: userId, email: user.email, reason: why, ...summary }, "Platform user deleted");

    return { success: true, message: `${user.name || user.email} was removed from the platform`, summary };
  }
}
