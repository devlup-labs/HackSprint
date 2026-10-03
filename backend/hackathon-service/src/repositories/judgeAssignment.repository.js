import JudgeAssignmentModel from "../models/judgeAssignment.model.js";

export class JudgeAssignmentRepository {
  async create(data, session = null) {
    const [assignment] = await JudgeAssignmentModel.create([data], { session });

    return assignment;
  }

  // Any invitation, whatever its state — used to manage invitations.
  async findAnyAssignment(hackathonId, judgeId) {
    return JudgeAssignmentModel.findOne({
      hackathon: hackathonId,
      judge: judgeId,
    });
  }

  async findById(id) {
    return JudgeAssignmentModel.findById(id);
  }

  // Only judges who accepted — this is the one that gates judging itself.
  async findJudgeAssignment(hackathonId, judgeId) {
    return JudgeAssignmentModel.findOne({
      hackathon: hackathonId,
      judge: judgeId,
      status: "ACCEPTED",
    });
  }

  // `includeAll` is for the organizer's invitation list (pending / declined
  // too); everything else wants accepted judges only.
  async getHackathonJudges(hackathonId, { includeAll = false } = {}) {
    return JudgeAssignmentModel.find({
      hackathon: hackathonId,
      ...(includeAll ? {} : { status: "ACCEPTED" }),
    })
      .populate("judge", "adminName email avatar")
      .populate("assignedBy", "adminName email")
      .sort({ createdAt: -1 })
      .lean()
      // An invitation whose admin account was later deleted points at nobody;
      // drop it rather than show an unremovable "Unknown" judge.
      .then((rows) => rows.filter((r) => r.judge));
  }

  async getJudgeHackathons(judgeId) {
    return JudgeAssignmentModel.find({
      judge: judgeId,
      status: "ACCEPTED",
    })
      .populate(
        "hackathon",
        "title subTitle slug image status phases numParticipants"
      )
      .sort({ createdAt: -1 })
      .lean();
  }

  async getPendingInvitations(judgeId) {
    return JudgeAssignmentModel.find({
      judge: judgeId,
      status: "PENDING",
    })
      .populate("hackathon", "title subTitle slug image phases")
      .populate("assignedBy", "adminName email organizationName")
      .sort({ createdAt: -1 })
      .lean();
  }

  // Rows created before invitations existed had no status; they were
  // already-working assignments, so they count as accepted.
  async backfillAcceptedStatus() {
    return JudgeAssignmentModel.updateMany(
      { status: { $exists: false } },
      { $set: { status: "ACCEPTED", respondedAt: new Date() } }
    );
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
      status: "ACCEPTED",
    });
  }
}
