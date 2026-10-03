import { wishlistService } from "../services/wishlistService/wishlist.service.instance.js";
import { hackathonService } from "../services/hackathonService/hackathon.service.instance.js";
import { submissionService } from "../services/submissionService/submission.service.instance.js";

export const getHackathonById = async (req, res, next) => {
  try {
    const hackathon = await hackathonService.getHackathonById(req.params.id);

    return res.status(200).json(hackathon);
  } catch (error) {
    next(error);
  }
};

export const getHackathonResults = async (req, res, next) => {
  try {
    const results = await submissionService.getHackathonResults(req.params.id);

    return res.status(200).json(results);
  } catch (error) {
    next(error);
  }
};

export const getHackathonGallery = async (req, res, next) => {
  try {
    const gallery = await hackathonService.getHackathonGallery(
      req.params.hackathonId
    );

    return res.status(200).json({
      success: true,
      gallery,
    });
  } catch (error) {
    next(error);
  }
};

export const toggleHackathonWishlist = async (req, res, next) => {
  try {
    const { hackathonId } = req.body;

    const result = await wishlistService.toggleHackathonWishlist(
      req.user?._id,
      hackathonId
    );

    return res.status(result.liked ? 201 : 200).json({
      success: true,
      liked: result.liked,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserHackathonWishlist = async (req, res, next) => {
  try {
    const result = await wishlistService.getUserWishlist(req.user?._id);

    return res.status(200).json({
      success: true,
      likedHackathons: result.likedHackathons,
      count: result.count,
    });
  } catch (error) {
    next(error);
  }
};

export const checkHackathonLiked = async (req, res, next) => {
  try {
    const result = await wishlistService.checkHackathonLiked(
      req.user?._id,
      req.params.hackathonId
    );

    return res.status(200).json({
      success: true,
      liked: result.liked,
    });
  } catch (error) {
    next(error);
  }
};

export const createHackathon = async (req, res, next) => {
  try {
    const hackathon = await hackathonService.createHackathon({
      adminId: req.admin._id,

      payload: req.body,
    });

    return res.status(201).json({
      success: true,

      hackathon,
    });
  } catch (error) {
    next(error);
  }
};

export const updateHackathon = async (req, res, next) => {
  try {
    const hackathon = await hackathonService.updateHackathon({
      hackathonId: req.params.id,

      adminId: req.admin._id,

      payload: req.body,
    });

    return res.status(200).json({
      success: true,
      hackathon,
    });
  } catch (error) {
    next(error);
  }
};

export const submitForApproval = async (req, res, next) => {
  try {
    const hackathon = await hackathonService.submitForApproval({
      hackathonId: req.params.id,

      adminId: req.admin._id,
    });

    return res.status(200).json({
      success: true,
      message: "Event submitted for approval",
      hackathon,
    });
  } catch (error) {
    next(error);
  }
};

export const getPendingHackathons = async (req, res, next) => {
  try {
    const hackathons = await hackathonService.getPendingHackathons(
      req.admin._id
    );

    return res.status(200).json({
      success: true,
      hackathons,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllHackathonsForController = async (req, res, next) => {
  try {
    const hackathons = await hackathonService.getAllHackathonsForController(
      req.admin._id
    );

    return res.status(200).json({
      success: true,
      hackathons,
    });
  } catch (error) {
    next(error);
  }
};

export const approveHackathon = async (req, res, next) => {
  try {
    const hackathon = await hackathonService.approveHackathon({
      hackathonId: req.params.id,

      controllerId: req.admin._id,
    });

    return res.status(200).json({
      success: true,
      message: "Event approved",
      hackathon,
    });
  } catch (error) {
    next(error);
  }
};

export const rejectHackathon = async (req, res, next) => {
  try {
    const hackathon = await hackathonService.rejectHackathon({
      hackathonId: req.params.id,
      controllerId: req.admin._id,
      reason: req.body.reason,
    });

    return res.status(200).json({
      success: true,
      message: "Event rejected",
      hackathon,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteHackathon = async (req, res, next) => {
  try {
    const result = await hackathonService.deleteHackathon({
      hackathonId: req.params.id,

      adminId: req.admin._id,
    });

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getPublicHackathons = async (req, res, next) => {
  try {
    const result = await hackathonService.getPublicHackathons(req.query);

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

export const getHackathonBySlug = async (req, res, next) => {
  try {
    const hackathon = await hackathonService.getHackathonBySlug(
      req.params.slug
    );

    return res.status(200).json({
      success: true,
      hackathon,
    });
  } catch (error) {
    next(error);
  }
};

export const getHackathonAdminOverview = async (req, res, next) => {
  try {
    const overview = await hackathonService.getHackathonAdminOverview({
      hackathonId: req.params.id,
      adminId: req.admin._id,
    });

    return res.status(200).json({
      success: true,
      ...overview,
    });
  } catch (error) {
    next(error);
  }
};

export const getEntitySubmissions = async (req, res, next) => {
  try {
    const overview = await hackathonService.getEntitySubmissions({
      hackathonId: req.params.id,
      adminId: req.admin._id,
      entityType: req.params.entityType,
      entityId: req.params.entityId,
    });

    return res.status(200).json({
      success: true,
      ...overview,
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminResults = async (req, res, next) => {
  try {
    const results = await hackathonService.getAdminResults({
      hackathonId: req.params.id,
      adminId: req.admin._id,
    });

    return res.status(200).json({
      success: true,
      results,
    });
  } catch (error) {
    next(error);
  }
};

export const releaseResults = async (req, res, next) => {
  try {
    const result = await hackathonService.releaseResults({
      hackathonId: req.params.id,
      adminId: req.admin._id,
    });

    return res.status(200).json({
      success: true,
      message: "Results released",
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

export const getPhaseSubmissions = async (req, res, next) => {
  try {
    const data = await hackathonService.getPhaseSubmissions({
      hackathonId: req.params.id,
      phaseId: req.params.phaseId,
      adminId: req.admin._id,
    });

    return res.status(200).json({
      success: true,
      ...data,
    });
  } catch (error) {
    next(error);
  }
};

export const concludeRound = async (req, res, next) => {
  try {
    const result = await hackathonService.concludeRound({
      hackathonId: req.params.id,
      phaseId: req.params.phaseId,
      adminId: req.admin._id,
    });

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

export const overrideQualification = async (req, res, next) => {
  try {
    const submission = await hackathonService.overrideQualification({
      hackathonId: req.params.id,
      submissionId: req.params.submissionId,
      adminId: req.admin._id,
      status: req.body.status,
    });

    return res.status(200).json({
      success: true,
      submission,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyHackathons = async (req, res, next) => {
  try {
    const hackathons = await hackathonService.getMyHackathons(req.admin._id);

    return res.status(200).json({
      success: true,
      hackathons,
    });
  } catch (error) {
    next(error);
  }
};
