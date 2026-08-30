import { judgeAssignmentService } from "../services/judgeAssignmentService/judgeAssignment.service.instance.js";

export const assignJudge = async (req, res, next) => {
  try {
    const assignment = await judgeAssignmentService.assignJudge({
      hackathonId: req.params.hackathonId,

      judgeId: req.body.judgeId,

      adminId: req.admin._id,

      isController: req.admin.controller,
    });

    return res.status(201).json({
      success: true,
      message: "Judge assigned successfully",
      assignment,
    });
  } catch (error) {
    next(error);
  }
};

export const getHackathonJudges = async (req, res, next) => {
  try {
    const judges = await judgeAssignmentService.getHackathonJudges({
      hackathonId: req.params.hackathonId,

      adminId: req.admin._id,

      isController: req.admin.controller,
    });

    return res.status(200).json({
      success: true,
      judges,
    });
  } catch (error) {
    next(error);
  }
};

export const removeJudge = async (req, res, next) => {
  try {
    const result = await judgeAssignmentService.removeJudge({
      hackathonId: req.params.hackathonId,

      judgeId: req.params.judgeId,

      adminId: req.admin._id,

      isController: req.admin.controller,
    });

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getAssignedHackathons = async (req, res, next) => {
  try {
    const hackathons = await judgeAssignmentService.getAssignedHackathons(
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
