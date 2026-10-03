import { skillService } from "../services/skillService/skill.service.instance.js";

export const searchSkills = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 10;
    const skills = await skillService.search(req.query.q, limit);

    return res.status(200).json({ success: true, skills });
  } catch (error) {
    next(error);
  }
};
