import { teamService } from "../services/teamService/team.service.instance.js";
import { BadRequestError } from "../errors/BadRequestError.js";

export const createTeam = async (req, res, next) => {
  try {
    const { hackathonId } = req.params;

    const { teamName } = req.body || {};

    if (!hackathonId) {
      throw new BadRequestError("Event id is required");
    }

    if (!teamName?.trim()) {
      throw new BadRequestError("Kindly provide a valid team name");
    }

    const team = await teamService.createTeam({
      userId: req.user._id,
      hackathonId,
      teamName: teamName.trim(),
    });

    return res.status(201).json({
      success: true,
      message: "Team created successfully",
      team,
    });
  } catch (error) {
    next(error);
  }
};

export const joinTeam = async (req, res, next) => {
  try {
    const { secretCode } = req.body || {};

    if (!secretCode) {
      throw new BadRequestError(
        "Kindly provide the team code to join the team"
      );
    }

    const result = await teamService.joinTeam({
      userId: req.user._id,
      secretCode,
    });

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const handleRequest = async (req, res, next) => {
  try {
    const { userId, action } = req.body || {};
    const { teamId } = req.params;

    if (!userId) {
      throw new BadRequestError("User id is required");
    }

    if (!action) {
      throw new BadRequestError("Kindly specify the action to perform");
    }

    const result = await teamService.handleRequest({
      leaderId: req.user._id,
      teamId,
      userId,
      action,
    });

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getPendingRequests = async (req, res, next) => {
  try {
    const { teamId } = req.params;

    const requests = await teamService.getPendingRequests({
      leaderId: req.user._id,
      teamId,
    });

    return res.json({
      success: true,
      requests,
    });
  } catch (error) {
    next(error);
  }
};

export const getTeamById = async (req, res, next) => {
  try {
    const { teamId } = req.params;

    if (!teamId) {
      throw new BadRequestError("Error fetching team details.");
    }

    const team = await teamService.getTeamById(teamId);

    return res.json({
      success: true,
      team,
    });
  } catch (error) {
    next(error);
  }
};

export const searchTeamByCode = async (req, res, next) => {
  try {
    const { secretCode } = req.params;

    const team = await teamService.searchTeamByCode(secretCode);

    return res.status(200).json({
      success: true,
      team,
    });
  } catch (error) {
    next(error);
  }
};

export const cancelJoinRequest = async (req, res, next) => {
  try {
    const { teamId } = req.params;

    const result = await teamService.cancelJoinRequest({
      userId: req.user._id,
      teamId,
    });

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const leaveTeam = async (req, res, next) => {
  try {
    const { teamId } = req.params;

    const result = await teamService.leaveTeam({
      userId: req.user._id,
      teamId,
    });

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const removeMember = async (req, res, next) => {
  try {
    const { teamId, userId } = req.params;

    const result = await teamService.removeMember({
      leaderId: req.user._id,
      teamId,
      userId,
    });

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const updateTeam = async (req, res, next) => {
  try {
    const { teamId } = req.params;

    const { teamName } = req.body;

    const team = await teamService.updateTeam({
      leaderId: req.user._id,
      teamId,
      teamName,
    });

    return res.status(200).json({
      success: true,
      message: "Team updated successfully",
      team,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTeam = async (req, res, next) => {
  try {
    const { teamId } = req.params;

    const result = await teamService.deleteTeam({
      leaderId: req.user._id,
      teamId,
    });

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
