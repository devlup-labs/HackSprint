import JudgeAssignmentModel from "../models/judgeAssignment.model.js";

export class JudgeAssignmentRepository {
  async create(data, session = null) {
    const [assignment] = await JudgeAssignmentModel.create([data], { session });

    return assignment;
  }

  async findJudgeAssignment(hackathonId, judgeId) {
    return JudgeAssignmentModel.findOne({
      hackathon: hackathonId,
      judge: judgeId,
    });
  }

  async getHackathonJudges(hackathonId) {
    return JudgeAssignmentModel.find({
      hackathon: hackathonId,
    })
      .populate("judge", "adminName email avatar")
      .populate("assignedBy", "adminName email")
      .sort({ createdAt: -1 })
      .lean();
  }

  async getJudgeHackathons(judgeId) {
    return JudgeAssignmentModel.find({
      judge: judgeId,
    })
      .populate(
        "hackathon",
        "title subTitle slug image status phases numParticipants"
      )
      .sort({ createdAt: -1 })
      .lean();
  }

  async removeJudge(hackathonId, judgeId) {
    return JudgeAssignmentModel.findOneAndDelete({
      hackathon: hackathonId,
      judge: judgeId,
    });
  }

  async exists(hackathonId, judgeId) {
    return JudgeAssignmentModel.exists({
      hackathon: hackathonId,
      judge: judgeId,
    });
  }
}
