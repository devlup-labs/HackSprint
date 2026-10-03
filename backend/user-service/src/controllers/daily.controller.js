import { dailyService } from "../services/dailyService/daily.service.instance.js";

export const getToday = async (req, res, next) => {
  try {
    const data = await dailyService.getToday(req.user._id);
    return res.status(200).json({ success: true, ...data });
  } catch (error) {
    next(error);
  }
};

export const answerToday = async (req, res, next) => {
  try {
    const data = await dailyService.answer(req.user._id, req.body.questionId, req.body.selectedIndex);
    return res.status(200).json({ success: true, ...data });
  } catch (error) {
    next(error);
  }
};

export const getActivity = async (req, res, next) => {
  try {
    const data = await dailyService.getActivity(req.user._id, req.query.days);
    return res.status(200).json({ success: true, ...data });
  } catch (error) {
    next(error);
  }
};
