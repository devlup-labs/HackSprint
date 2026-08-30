import mongoose from "mongoose";
import { BadRequestError } from "../../errors/BadRequestError.js";
import { NotFoundError } from "../../errors/NotFoundError.js";
import { ConflictError } from "../../errors/ConflictError.js";

export class ProfileService {
  constructor(profileRepository, mediaServiceClient, logger, contactRequestRepository, notificationClient) {
    this.profileRepository = profileRepository;
    this.mediaServiceClient = mediaServiceClient;
    this.logger = logger;
    this.contactRequestRepository = contactRequestRepository;
    this.notificationClient = notificationClient;
  }

  async getPeopleForCluster() {
    return this.profileRepository.getPeopleForCluster();
  }

  // One-shot outreach, not a chat — the unique index on the ContactRequest
  // model is the real enforcement of "one message per profile"; this check
  // just gives a clean error instead of a raw duplicate-key one. Keyed by
  // id, not username — the People directory shows every opted-in user,
  // including ones who never set a username.
  async sendContactRequest(senderId, recipientId, message) {
    if (!message?.trim()) {
      throw new BadRequestError("Message is required");
    }

    const recipient = await this.profileRepository.getByIdPublic(recipientId);

    if (!recipient) {
      throw new NotFoundError("User not found");
    }

    if (recipient._id.toString() === senderId.toString()) {
      throw new BadRequestError("You can't message yourself");
    }

    const alreadyContacted = await this.contactRequestRepository.exists(
      senderId,
      recipient._id
    );

    if (alreadyContacted) {
      throw new ConflictError("You've already reached out to this person");
    }

    const sender = await this.profileRepository.getById(senderId);

    try {
      await this.contactRequestRepository.create(senderId, recipient._id, message.trim());
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictError("You've already reached out to this person");
      }
      throw error;
    }

    await this.notificationClient.createNotification({
      userId: recipient._id,
      title: `${sender.name} wants to connect`,
      message: message.trim(),
      type: "SYSTEM",
      actionUrl: sender.userName ? `/u/${sender.userName}` : "",
      metadata: { senderId: senderId.toString() },
    });

    return { success: true };
  }

  async getMyProfile(userId) {
    const user = await this.profileRepository.getById(userId);

    if (!user) {
      throw new NotFoundError("User not found");
    }

    return user;
  }

  async getPublicProfile(userName) {
    const user = await this.profileRepository.getPublicProfile(userName);

    if (!user) {
      throw new NotFoundError("User not found");
    }

    return user.publicProfile;
  }

  async updateProfile(userId, payload) {
    const { name, userName, bio, location, contactNumber, gender, showOnPeoplePage } = payload;

    const updateData = { name, bio, location, contactNumber };

    if (gender) {
      updateData.gender = gender;
    }

    if (typeof showOnPeoplePage === "boolean") {
      updateData.showOnPeoplePage = showOnPeoplePage;
    }

    if (userName !== undefined) {
      const normalized = userName.trim().toLowerCase();

      if (normalized) {
        if (!/^[a-z0-9_]{3,20}$/.test(normalized)) {
          throw new BadRequestError(
            "Username must be 3-20 characters: letters, numbers, and underscores only"
          );
        }

        updateData.userName = normalized;
      }
    }

    let updatedUser;

    try {
      updatedUser = await this.profileRepository.updateProfile(userId, updateData);
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictError("Username already taken");
      }

      throw error;
    }

    if (!updatedUser) {
      throw new NotFoundError("User not found");
    }

    this.logger.info(
      {
        userId,
      },
      "Profile updated"
    );

    return updatedUser;
  }

  async searchProfiles(query) {
    const trimmed = (query || "").trim().toLowerCase();

    if (trimmed.length < 2) {
      return [];
    }

    return this.profileRepository.searchByUsername(trimmed, 8);
  }

  async addEducation(userId, payload) {
    const { institute, passOutYear, department, location } = payload;

    if (!institute || !passOutYear || !department || !location) {
      throw new BadRequestError("All education fields are required");
    }

    const user = await this.profileRepository.addEducation(userId, payload);

    return user.education;
  }

  async updateEducation(userId, educationId, payload) {
    if (!mongoose.Types.ObjectId.isValid(educationId)) {
      throw new BadRequestError("Invalid education id");
    }

    const user = await this.profileRepository.updateEducation(
      userId,
      educationId,
      payload
    );

    if (!user) {
      throw new NotFoundError("Education not found");
    }

    return user.education;
  }

  async removeEducation(userId, educationId) {
    if (!mongoose.Types.ObjectId.isValid(educationId)) {
      throw new BadRequestError("Invalid education id");
    }

    const user = await this.profileRepository.removeEducation(
      userId,
      educationId
    );

    if (!user) {
      throw new NotFoundError("User not found");
    }

    return user.education;
  }

  async addConnectedApp(userId, payload) {
    const { appName, appURL } = payload;

    if (!appName || !appURL) {
      throw new BadRequestError("App name and URL are required");
    }

    const user = await this.profileRepository.addConnectedApp(userId, payload);

    return user.connectedApps;
  }

  async updateConnectedApp(userId, appId, payload) {
    if (!mongoose.Types.ObjectId.isValid(appId)) {
      throw new BadRequestError("Invalid app id");
    }

    const user = await this.profileRepository.updateConnectedApp(
      userId,
      appId,
      payload
    );

    if (!user) {
      throw new NotFoundError("Connected app not found");
    }

    return user.connectedApps;
  }

  async removeConnectedApp(userId, appId) {
    if (!mongoose.Types.ObjectId.isValid(appId)) {
      throw new BadRequestError("Invalid app id");
    }

    const user = await this.profileRepository.removeConnectedApp(userId, appId);

    if (!user) {
      throw new NotFoundError("User not found");
    }

    return user.connectedApps;
  }

  async updateSkills(userId, skills) {
    if (!Array.isArray(skills)) {
      throw new BadRequestError("Skills must be an array");
    }

    const user = await this.profileRepository.updateSkills(userId, skills);

    return user.skills;
  }

  async updateLanguages(userId, languages) {
    if (!Array.isArray(languages)) {
      throw new BadRequestError("Languages must be an array");
    }

    const user = await this.profileRepository.updateLanguages(
      userId,
      languages
    );

    return user.languages;
  }

  async updateAvatar(userId, image) {
    if (!image?.url || !image?.key) {
      throw new BadRequestError("Invalid image");
    }

    const existingUser = await this.profileRepository.findById(userId);

    if (!existingUser) {
      throw new NotFoundError("User not found");
    }

    if (existingUser.image?.key && existingUser.image.key !== image.key) {
      try {
        await this.mediaServiceClient.deleteFile(existingUser.image.key);
      } catch (error) {
        this.logger.error(
          {
            err: error,
            userId,
          },
          "Failed to delete old avatar"
        );
      }
    }

    const user = await this.profileRepository.updateAvatar(userId, image);

    return user.image;
  }
}
