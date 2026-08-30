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

export const getPeopleForCluster = async (req, res, next) => {
  try {
    const people = await profileService.getPeopleForCluster();

    return res.status(200).json({
      success: true,
      people,
    });
  } catch (error) {
    next(error);
  }
};

export const sendContactRequest = async (req, res, next) => {
  try {
    const result = await profileService.sendContactRequest(
      req.user._id,
      req.params.userId,
      req.body.message
    );

    return res.status(201).json(result);
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

export const updateLanguages = async (req, res, next) => {
  try {
    const languages = await profileService.updateLanguages(
      req.user._id,
      req.body.languages
    );

    return res.status(200).json({
      success: true,
      languages,
    });
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
