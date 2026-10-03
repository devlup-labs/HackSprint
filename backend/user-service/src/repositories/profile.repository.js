import mongoose from "mongoose";
import UserModel from "../models/user.models.js";

export class ProfileRepository {
  async getById(userId) {
    return UserModel.findById(userId);
  }

  async findById(userId) {
    return UserModel.findById(userId);
  }

  async getPublicProfile(userName) {
    return UserModel.findOne({
      userName,
    });
  }

  // The People directory only ever lists people who left themselves visible;
  // being incomplete (no photo, no skills) doesn't hide anyone — it just
  // sorts them lower.
  async searchPeople({ q, skill, page, limit, sample }) {
    const match = { showOnPeoplePage: { $ne: false } };

    const term = (q || "").trim();
    if (term) {
      const safe = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      match.$or = [
        { name: { $regex: safe, $options: "i" } },
        { userName: { $regex: safe, $options: "i" } },
      ];
    }
    if (skill) match.skills = skill;

    const project = { name: 1, userName: 1, "image.url": 1, skills: 1, location: 1, bio: 1 };

    if (sample) {
      const people = await UserModel.aggregate([
        { $match: { ...match, "image.url": { $exists: true, $ne: "" } } },
        { $sample: { size: limit } },
        { $project: project },
      ]);
      return { people, total: people.length };
    }

    const total = await UserModel.countDocuments(match);
    const people = await UserModel.aggregate([
      { $match: match },
      {
        $addFields: {
          // A photo and some skills make a card worth looking at — float
          // those up, newest first within each tier.
          _score: {
            $add: [
              { $cond: [{ $gt: [{ $strLenCP: { $ifNull: ["$image.url", ""] } }, 0] }, 2, 0] },
              { $cond: [{ $gt: [{ $size: { $ifNull: ["$skills", []] } }, 0] }, 1, 0] },
            ],
          },
        },
      },
      { $sort: { _score: -1, _id: -1 } },
      { $skip: (page - 1) * limit },
      { $limit: limit },
      { $project: project },
    ]);
    return { people, total };
  }

  // A building's residents: visible users with at least one of its skills,
  // photo + profile-rich people first, then most recently active.
  async getDistrictPeople(skills, page, limit) {
    const match = { showOnPeoplePage: { $ne: false }, skills: { $in: skills } };
    const rows = await UserModel.aggregate([
      { $match: match },
      {
        $addFields: {
          _score: {
            $add: [
              { $cond: [{ $gt: [{ $strLenCP: { $ifNull: ["$image.url", ""] } }, 0] }, 2, 0] },
              { $cond: [{ $gt: [{ $strLenCP: { $ifNull: ["$bio", ""] } }, 0] }, 1, 0] },
            ],
          },
        },
      },
      { $sort: { _score: -1, updatedAt: -1, _id: -1 } },
      { $skip: (page - 1) * limit },
      // One extra row tells us whether there is another page without a count.
      { $limit: limit + 1 },
      { $project: { name: 1, userName: 1, "image.url": 1, skills: 1, location: 1, bio: 1 } },
    ]);
    return { people: rows.slice(0, limit), hasNext: rows.length > limit };
  }

  async getPeopleStats() {
    const visible = { showOnPeoplePage: { $ne: false } };
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const [members, newThisWeek, skills] = await Promise.all([
      UserModel.countDocuments(visible),
      UserModel.countDocuments({ ...visible, createdAt: { $gte: weekAgo } }),
      UserModel.distinct("skills", visible),
    ]);
    return { members, newThisWeek, skills: skills.length };
  }

  // People who share the most skills with this user, most overlap first.
  async getSuggestedPeople(userId, limit) {
    const me = await UserModel.findById(userId).select("skills").lean();
    const mine = me?.skills || [];
    if (mine.length === 0) return [];

    return UserModel.aggregate([
      {
        $match: {
          showOnPeoplePage: { $ne: false },
          _id: { $ne: new mongoose.Types.ObjectId(String(userId)) },
          skills: { $in: mine },
        },
      },
      { $addFields: { shared: { $size: { $setIntersection: ["$skills", mine] } } } },
      { $sort: { shared: -1, _id: -1 } },
      { $limit: limit },
      { $project: { name: 1, userName: 1, "image.url": 1, skills: 1, location: 1, bio: 1, shared: 1 } },
    ]);
  }

  async getByIdPublic(userId) {
    return UserModel.findById(userId).select("_id name userName");
  }

  async searchByUsername(query, limit) {
    const safe = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    return UserModel.find({
      userName: { $regex: `^${safe}`, $options: "i" },
    })
      .select("_id name userName image")
      .limit(limit);
  }

  // Exact (already-normalized, lowercase) match, optionally ignoring one
  // user so someone re-saving their own username doesn't "conflict" with
  // themselves.
  async isUserNameTaken(userName, excludeUserId) {
    const query = { userName };
    if (excludeUserId) query._id = { $ne: excludeUserId };
    return !!(await UserModel.exists(query));
  }

  async updateProfile(userId, data) {
    return UserModel.findByIdAndUpdate(
      userId,
      {
        $set: data,
      },
      {
        new: true,
      }
    );
  }

  async addEducation(userId, education) {
    return UserModel.findByIdAndUpdate(
      userId,
      {
        $push: {
          education,
        },
      },
      {
        new: true,
      }
    );
  }

  async updateEducation(userId, educationId, data) {
    return UserModel.findOneAndUpdate(
      {
        _id: userId,
        "education._id": educationId,
      },
      {
        $set: {
          "education.$": {
            _id: educationId,
            ...data,
          },
        },
      },
      {
        new: true,
      }
    );
  }

  async removeEducation(userId, educationId) {
    return UserModel.findByIdAndUpdate(
      userId,
      {
        $pull: {
          education: {
            _id: educationId,
          },
        },
      },
      {
        new: true,
      }
    );
  }

  async addConnectedApp(userId, app) {
    return UserModel.findByIdAndUpdate(
      userId,
      {
        $push: {
          connectedApps: app,
        },
      },
      {
        new: true,
      }
    );
  }

  async updateConnectedApp(userId, appId, app) {
    return UserModel.findOneAndUpdate(
      {
        _id: userId,
        "connectedApps._id": appId,
      },
      {
        $set: {
          "connectedApps.$": {
            _id: appId,
            ...app,
          },
        },
      },
      {
        new: true,
      }
    );
  }

  async removeConnectedApp(userId, appId) {
    return UserModel.findByIdAndUpdate(
      userId,
      {
        $pull: {
          connectedApps: {
            _id: appId,
          },
        },
      },
      {
        new: true,
      }
    );
  }

  async updateSkills(userId, skills) {
    return UserModel.findByIdAndUpdate(
      userId,
      {
        skills,
      },
      {
        new: true,
      }
    );
  }

  async updateAvatar(userId, image) {
    return UserModel.findByIdAndUpdate(
      userId,
      {
        $set: {
          image,
        },
      },
      {
        new: true,
      }
    );
  }
}
