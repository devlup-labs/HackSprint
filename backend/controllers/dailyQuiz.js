import devquestModel from "../models/devquest.model.js";
import dailyQuizModel from "../models/dailyQuiz.model.js";
import { getISTDayBounds } from "../utils/date.js";

export const getDailyQuiz = async (req, res) => {
  try {
    const { startUTC, endUTC } = getISTDayBounds(new Date());

    const dailyQuiz = await dailyQuizModel
      .findOne({
        date: { $gte: startUTC, $lte: endUTC }
      })
      .populate("questions")
      .sort({ createdAt: -1 });

    if (!dailyQuiz) {
      return res.status(404).json({ message: "No quiz set for today yet" });
    }

    res.status(200).json({
      message: "Today's latest quiz",
      dailyQuiz
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const sendAllQuizData = async (req, res) => {
  try {
    const allQuizzes = await dailyQuizModel.find()
      .populate("questions")
      .sort({ createdAt: -1 });

    if (!allQuizzes || allQuizzes.length === 0) {
      return res.status(404).json({ message: "No quizzes found" });
    }
    
    const quizzesExcludingLatest = allQuizzes.slice(1);

    res.status(200).json({
      message: "Successfully retrieved quiz data (excluding latest)",
      quizData: quizzesExcludingLatest,
    });
  } catch (error) {
    console.error("Error in sendAllQuizData:", error);
    res.status(500).json({
      message: error.message,
    });
  }
};