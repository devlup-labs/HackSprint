import cron from "node-cron";
import dailyQuizModel from "../models/dailyQuiz.model.js";
import devquestModel from "../models/devquest.model.js";
import RegisteredParticipantsModel from "../models/registeredParticipants.js";
import { getISTDayBounds } from "../utils/date.js";
import { sendMail } from "../emailService/brevoEmail.js";

export const runDailyQuizAutomation = async () => {
  try {
    console.log("Running Daily Quiz Automation...");

    const { startUTC, endUTC } = getISTDayBounds(new Date());

    const existingQuiz = await dailyQuizModel.findOne({
      date: { $gte: startUTC, $lte: endUTC },
    });

    if (existingQuiz) {
      console.log("Quiz already exists for today");
      return;
    }

    let randomQuestions = await devquestModel.aggregate([
      { $match: { isAlreadyDisplayed: false } },
      { $sample: { size: 5 } },
    ]);

    if (randomQuestions.length < 5) {
      await devquestModel.updateMany({}, { isAlreadyDisplayed: false });

      randomQuestions = await devquestModel.aggregate([
        { $sample: { size: 5 } },
      ]);
    }

    await dailyQuizModel.create({
      Title: "Daily Quiz",
      date: new Date(),
      questions: randomQuestions.map((q) => q._id),
    });

    await devquestModel.updateMany(
      { _id: { $in: randomQuestions.map((q) => q._id) } },
      { $set: { isAlreadyDisplayed: true } }
    );

    console.log("Quiz created");

    const participants = await RegisteredParticipantsModel.find({
      email: { $exists: true, $ne: null },
    });

    const uniqueEmails = [
      ...new Map(
        participants.map((p) => [
          p.email.toLowerCase(),
          { email: p.email, name: p.name },
        ])
      ).values(),
    ];

    const BATCH_SIZE = 50;

    for (let i = 0; i < uniqueEmails.length; i += BATCH_SIZE) {
      const batch = uniqueEmails.slice(i, i + BATCH_SIZE);

      await Promise.all(
        batch.map((user) =>
          sendMail({
            to: user.email,
            subject: "Daily Quiz is Live!",
            templateName: "quizEmail",
            data: {
              name: user.name || "Participant",
            },
          })
        )
      );

      await new Promise((res) => setTimeout(res, 500));
    }

    console.log("Emails sent");
  } catch (err) {
    console.error("Error:", err);
  }
};
