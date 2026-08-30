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

  // Every opted-in user, regardless of whether their profile is complete —
  // the point of this page is broad interaction, not filtering people out
  // for missing a username, skills, or a photo.
  async getPeopleForCluster() {
    return UserModel.find({
      showOnPeoplePage: { $ne: false },
    })
      .select("_id name userName image skills")
      .lean();
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

  async updateLanguages(userId, languages) {
    return UserModel.findByIdAndUpdate(
      userId,
      {
        languages,
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
