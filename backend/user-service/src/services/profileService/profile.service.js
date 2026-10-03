import mongoose from "mongoose";
import { BadRequestError } from "../../errors/BadRequestError.js";
import { NotFoundError } from "../../errors/NotFoundError.js";
import { ConflictError } from "../../errors/ConflictError.js";
import { CAMPUS_DISTRICTS, getDistrict } from "../../data/campusDistricts.js";

const USERNAME_PATTERN = /^[a-z0-9_]{3,20}$/;
const GENDERS = ["male", "female", "other", "prefer_not_to_say"];
const PHONE_PATTERN = /^\+?[0-9]{10,15}$/;

// Profiles change rarely and are read constantly (People directory, profile
// pages), so they are served from Redis and refreshed on every write.
const PROFILE_TTL = 30 * 60;
const LIST_TTL = 2 * 60;
const profileKey = (userName) => `profile:public:${userName}`;

export class ProfileService {
  constructor(profileRepository, mediaServiceClient, logger, skillService, cacheService) {
    this.cacheService = cacheService;
    this.profileRepository = profileRepository;
    this.mediaServiceClient = mediaServiceClient;
    this.logger = logger;
    this.skillService = skillService;
  }

  async checkUserNameAvailability(userId, rawUserName) {
    const userName = (rawUserName || "").trim().toLowerCase();

    if (!USERNAME_PATTERN.test(userName)) {
      return { available: false, reason: "invalid" };
    }

    const taken = await this.profileRepository.isUserNameTaken(userName, userId);
    return { available: !taken, reason: taken ? "taken" : null };
  }

  async searchPeople({ q, skill, page, limit, sample }) {
    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 24, 1), 60);
    const params = {
      q: typeof q === "string" ? q.slice(0, 60) : "",
      skill: typeof skill === "string" ? skill.slice(0, 60) : "",
      page: pageNum,
      limit: limitNum,
      sample: sample === "1" || sample === true,
    };

    const load = async () => {
      const { people, total } = await this.profileRepository.searchPeople(params);
      return {
        people,
        pagination: { page: pageNum, limit: limitNum, total, hasNext: pageNum * limitNum < total },
      };
    };

    // "sample" is a random pick, so it must not be cached. Everything else is
    // a short-lived list (a new member showing up a couple of minutes late is
    // fine), keyed by the exact query.
    if (params.sample) return load();
    const key = `people:search:${params.q.toLowerCase()}:${params.skill.toLowerCase()}:${pageNum}:${limitNum}`;
    return this.cacheService.remember(key, LIST_TTL, load);
  }

  // First few residents of every building — the landing payload of the People
  // page, so it shouldn't hit the DB per view.
  async getCampus() {
    return this.cacheService.remember("people:campus", LIST_TTL, () =>
      Promise.all(
        CAMPUS_DISTRICTS.map(async (d) => {
          const { people } = await this.profileRepository.getDistrictPeople(d.skills, 1, 5);
          return { id: d.id, name: d.name, tagline: d.tagline, skills: d.skills.slice(0, 8), people };
        })
      )
    );
  }

  async getDistrictPeople(districtId, page, limit) {
    const district = getDistrict(districtId);
    if (!district) throw new NotFoundError("That building doesn't exist");
    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 5, 1), 20);
    return this.cacheService.remember(`people:district:${district.id}:${pageNum}:${limitNum}`, LIST_TTL, async () => {
      const { people, hasNext } = await this.profileRepository.getDistrictPeople(district.skills, pageNum, limitNum);
      return { people, pagination: { page: pageNum, limit: limitNum, hasNext } };
    });
  }

  async getPeopleStats() {
    return this.cacheService.remember("people:stats", LIST_TTL, () => this.profileRepository.getPeopleStats());
  }

  async getSuggestedPeople(userId) {
    return this.profileRepository.getSuggestedPeople(userId, 8);
  }

  async getMyProfile(userId) {
    const user = await this.profileRepository.getById(userId);

    if (!user) {
      throw new NotFoundError("User not found");
    }

    return user;
  }

  async getPublicProfile(userName) {
    const key = profileKey(userName);

    const cached = await this.cacheService.get(key);
    if (cached) return cached;

    const user = await this.profileRepository.getPublicProfile(userName);

    if (!user) {
      throw new NotFoundError("User not found");
    }

    await this.cacheService.set(key, user.publicProfile, PROFILE_TTL);
    return user.publicProfile;
  }

  // Write-through: after any change to a profile, store the fresh public view
  // under the user's current username (and drop the old key if it changed), so
  // the next reader gets the new data without a cold miss.
  async refreshProfileCache(userId, previousUserName) {
    try {
      const user = await this.profileRepository.getById(userId);
      if (!user) return;
      if (previousUserName && previousUserName !== user.userName) {
        await this.cacheService.del(profileKey(previousUserName));
      }
      if (user.userName) {
        await this.cacheService.set(profileKey(user.userName), user.publicProfile, PROFILE_TTL);
      }
    } catch (err) {
      this.logger.warn({ err, userId }, "Profile cache refresh failed");
    }
  }

  async updateProfile(userId, payload) {
    const { name, userName, bio, location, contactNumber, gender, showOnPeoplePage } = payload;

    // Only fields actually sent get written — the People-directory toggle
    // sends just { showOnPeoplePage }, and must not blank out everything else.
    const updateData = {};

    if (name !== undefined) {
      if (!String(name).trim()) {
        throw new BadRequestError("Name is required");
      }
      updateData.name = String(name).trim();
    }

    if (bio !== undefined) {
      if (String(bio).length > 500) {
        throw new BadRequestError("Bio can be at most 500 characters");
      }
      updateData.bio = String(bio).trim();
    }

    if (location !== undefined) {
      updateData.location = String(location).trim();
    }

    if (contactNumber !== undefined) {
      const phone = String(contactNumber).trim();
      if (phone && !PHONE_PATTERN.test(phone)) {
        throw new BadRequestError("Contact number must be 10-15 digits, optionally starting with +");
      }
      updateData.contactNumber = phone;
    }

    if (gender) {
      if (!GENDERS.includes(gender)) {
        throw new BadRequestError("Invalid gender");
      }
      updateData.gender = gender;
    }

    if (typeof showOnPeoplePage === "boolean") {
      updateData.showOnPeoplePage = showOnPeoplePage;
    }

    // A username can be changed but never cleared — it's required to take
    // part in hackathons, so an empty value is simply ignored.
    if (userName !== undefined) {
      const normalized = userName.trim().toLowerCase();

      if (normalized) {
        if (!USERNAME_PATTERN.test(normalized)) {
          throw new BadRequestError(
            "Username must be 3-20 characters: letters, numbers, and underscores only"
          );
        }

        if (await this.profileRepository.isUserNameTaken(normalized, userId)) {
          throw new ConflictError("Username already taken");
        }

        updateData.userName = normalized;
      }
    }

    let updatedUser;
    const previousUserName = updateData.userName
      ? (await this.profileRepository.getById(userId))?.userName
      : undefined;

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

    await this.refreshProfileCache(userId, previousUserName);

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

    await this.refreshProfileCache(userId);

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

    await this.refreshProfileCache(userId);

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

    await this.refreshProfileCache(userId);

    return user.education;
  }

  async addConnectedApp(userId, payload) {
    const { appName, appURL } = payload;

    if (!appName || !appURL) {
      throw new BadRequestError("App name and URL are required");
    }

    const user = await this.profileRepository.addConnectedApp(userId, payload);

    await this.refreshProfileCache(userId);

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

    await this.refreshProfileCache(userId);

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

    await this.refreshProfileCache(userId);

    return user.connectedApps;
  }

  async updateSkills(userId, skills) {
    const canonical = await this.skillService.resolveCanonicalSkills(skills);

    const user = await this.profileRepository.updateSkills(userId, canonical);

    await this.refreshProfileCache(userId);

    return user.skills;
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

    await this.refreshProfileCache(userId);

    return user.image;
  }
}
