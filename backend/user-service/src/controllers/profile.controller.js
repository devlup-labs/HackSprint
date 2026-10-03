import { profileService } from "../services/profileService/profile.service.instance.js";

export const getMyProfile = async (req, res, next) => {
  try {
    const profile = await profileService.getMyProfile(req.user._id);

    return res.status(200).json({
      success: true,
      profile,
    });
  } catch (error) {
    next(error);
  }
};

export const getPublicProfile = async (req, res, next) => {
  try {
    const profile = await profileService.getPublicProfile(req.params.userName);

    return res.status(200).json({
      success: true,
      profile,
    });
  } catch (error) {
    next(error);
  }
};

export const getPeople = async (req, res, next) => {
  try {
    const result = await profileService.searchPeople(req.query);

    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const getCampus = async (req, res, next) => {
  try {
    const districts = await profileService.getCampus();

    return res.status(200).json({ success: true, districts });
  } catch (error) {
    next(error);
  }
};

export const getDistrictPeople = async (req, res, next) => {
  try {
    const result = await profileService.getDistrictPeople(req.params.districtId, req.query.page, req.query.limit);

    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const getPeopleStats = async (req, res, next) => {
  try {
    const stats = await profileService.getPeopleStats();

    return res.status(200).json({ success: true, ...stats });
  } catch (error) {
    next(error);
  }
};

export const getSuggestedPeople = async (req, res, next) => {
  try {
    const people = await profileService.getSuggestedPeople(req.user._id);

    return res.status(200).json({ success: true, people });
  } catch (error) {
    next(error);
  }
};

export const searchProfiles = async (req, res, next) => {
  try {
    const results = await profileService.searchProfiles(req.query.q);

    return res.status(200).json({
      success: true,
      results,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const profile = await profileService.updateProfile(req.user._id, req.body);

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      profile,
    });
  } catch (error) {
    next(error);
  }
};

export const addEducation = async (req, res, next) => {
  try {
    const education = await profileService.addEducation(req.user._id, req.body);

    return res.status(201).json({
      success: true,
      education,
    });
  } catch (error) {
    next(error);
  }
};

export const updateEducation = async (req, res, next) => {
  try {
    const education = await profileService.updateEducation(
      req.user._id,
      req.params.id,
      req.body
    );

    return res.status(200).json({
      success: true,
      education,
    });
  } catch (error) {
    next(error);
  }
};

export const removeEducation = async (req, res, next) => {
  try {
    const education = await profileService.removeEducation(
      req.user._id,
      req.params.id
    );

    return res.status(200).json({
      success: true,
      education,
    });
  } catch (error) {
    next(error);
  }
};

export const addConnectedApp = async (req, res, next) => {
  try {
    const connectedApps = await profileService.addConnectedApp(
      req.user._id,
      req.body
    );

    return res.status(201).json({
      success: true,
      connectedApps,
    });
  } catch (error) {
    next(error);
  }
};

export const updateConnectedApp = async (req, res, next) => {
  try {
    const connectedApps = await profileService.updateConnectedApp(
      req.user._id,
      req.params.id,
      req.body
    );

    return res.status(200).json({
      success: true,
      connectedApps,
    });
  } catch (error) {
    next(error);
  }
};

export const removeConnectedApp = async (req, res, next) => {
  try {
    const connectedApps = await profileService.removeConnectedApp(
      req.user._id,
      req.params.id
    );

    return res.status(200).json({
      success: true,
      connectedApps,
    });
  } catch (error) {
    next(error);
  }
};

export const updateSkills = async (req, res, next) => {
  try {
    const skills = await profileService.updateSkills(
      req.user._id,
      req.body.skills
    );

    return res.status(200).json({
      success: true,
      skills,
    });
  } catch (error) {
    next(error);
  }
};

export const checkUserName = async (req, res, next) => {
  try {
    const result = await profileService.checkUserNameAvailability(
      req.user._id,
      req.params.userName
    );

    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const updateAvatar = async (req, res, next) => {
  try {
    const image = await profileService.updateAvatar(
      req.user._id,
      req.body.image
    );

    return res.status(200).json({
      success: true,
      image,
    });
  } catch (error) {
    next(error);
  }
};
