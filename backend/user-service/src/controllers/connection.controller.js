import { connectionService } from "../services/connectionService/connection.service.instance.js";

export const sendRequest = async (req, res, next) => {
  try {
    const result = await connectionService.sendRequest(
      req.user._id,
      req.params.userId,
      req.body.message
    );

    return res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const acceptRequest = async (req, res, next) => {
  try {
    const result = await connectionService.acceptRequest(
      req.params.id,
      req.user._id,
      req.body.message
    );

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const declineRequest = async (req, res, next) => {
  try {
    const result = await connectionService.declineRequest(req.params.id, req.user._id);

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const listFriends = async (req, res, next) => {
  try {
    const friends = await connectionService.listFriends(req.user._id);

    return res.status(200).json({ success: true, friends });
  } catch (error) {
    next(error);
  }
};

export const getStatuses = async (req, res, next) => {
  try {
    const statuses = await connectionService.getStatuses(req.user._id, req.query.ids);

    return res.status(200).json({ success: true, statuses });
  } catch (error) {
    next(error);
  }
};
