import DailyQuestionModel from "../models/dailyQuestion.models.js";
import DailyAttemptModel from "../models/dailyAttempt.models.js";

export class DailyRepository {
  async seedQuestions(entries) {
    if (entries.length === 0) return;
    await DailyQuestionModel.bulkWrite(
      entries.map((e) => ({
        updateOne: {
          filter: { key: e.key },
          update: { $set: { ...e, active: true } },
          upsert: true,
        },
      })),
      { ordered: false }
    );
    await DailyQuestionModel.updateMany(
      { key: { $nin: entries.map((e) => e.key) } },
      { $set: { active: false } }
    );
  }

  async listQuestionIds() {
    return DailyQuestionModel.find({ active: true }).select("_id").sort({ key: 1 }).lean();
  }

  async getQuestion(id) {
    return DailyQuestionModel.findById(id).lean();
  }

  async findAttempt(userId, dateKey) {
    return DailyAttemptModel.findOne({ userId, dateKey }).lean();
  }

  async createAttempt(data) {
    return DailyAttemptModel.create(data);
  }

  async listAttemptsSince(userId, sinceDateKey) {
    return DailyAttemptModel.find({ userId, dateKey: { $gte: sinceDateKey } })
      .select("dateKey correct")
      .sort({ dateKey: 1 })
      .lean();
  }

  async listAllAttempts(userId) {
    return DailyAttemptModel.find({ userId }).select("dateKey correct questionId").lean();
  }
}
