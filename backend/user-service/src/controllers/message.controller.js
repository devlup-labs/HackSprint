import { messageService } from "../services/messageService/message.service.instance.js";

export const sendMessage = async (req, res, next) => {
  try {
    const { message, created } = await messageService.sendMessage(
      req.user._id,
      req.params.friendId,
      req.body.content,
      req.body.clientId
    );

    // 200 for a retry of something already saved, 201 for a new message.
    return res.status(created ? 201 : 200).json({ success: true, message });
  } catch (error) {
    next(error);
  }
};

export const listMessages = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;

    const messages = await messageService.listMessages(
      req.user._id,
      req.params.friendId,
      page,
      limit
    );

    return res.status(200).json({ success: true, messages });
  } catch (error) {
    next(error);
  }
};
