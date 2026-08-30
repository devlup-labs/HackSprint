import { generateReply } from "../services/gemini.service.js";
import { BadRequestError } from "../errors/BadRequestError.js";

export const chat = async (req, res, next) => {
  try {
    const { message, history } = req.body || {};

    if (!message || typeof message !== "string" || !message.trim()) {
      throw new BadRequestError("Kindly provide a message");
    }

    const reply = await generateReply(message.trim(), history);

    return res.status(200).json({
      success: true,
      reply,
    });
  } catch (error) {
    next(error);
  }
};
