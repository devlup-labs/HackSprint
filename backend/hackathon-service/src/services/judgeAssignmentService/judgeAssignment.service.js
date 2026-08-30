import mongoose from "mongoose";
import { BadRequestError } from "../../errors/BadRequestError.js";
import { NotFoundError } from "../../errors/NotFoundError.js";
import { ForbiddenError } from "../../errors/ForbiddenError.js";

export class JudgeAssignmentService {
  constructor(
    judgeAssignmentRepository,
    hackathonRepository,
    adminRepository,
    logger
  ) {
    this.judgeAssignmentRepository = judgeAssignmentRepository;

    this.hackathonRepository = hackathonRepository;

    this.adminRepository = adminRepository;

    this.logger = logger;
  }

  async assignJudge({ hackathonId, judgeId, adminId, isController }) {
    if (!mongoose.Types.ObjectId.isValid(hackathonId)) {
      throw new BadRequestError("Invalid hackathon id");
    }

    if (!mongoose.Types.ObjectId.isValid(judgeId)) {
      throw new BadRequestError("Invalid judge id");
    }

    const hackathon = await this.hackathonRepository.getById(hackathonId);

    if (!hackathon) {
      throw new NotFoundError("Hackathon not found");
    }

    const canManage =
      isController ||
      hackathon.createdBy?._id?.toString() === adminId.toString();

    if (!canManage) {
      throw new ForbiddenError("Unauthorized");
    }

    const judge = await this.adminRepository.getById(judgeId);

    if (!judge) {
      throw new NotFoundError("Judge not found");
    }

    const existing = await this.judgeAssignmentRepository.exists(
      hackathonId,
      judgeId
    );

    if (existing) {
      throw new BadRequestError("Judge already assigned");
    }

    const assignment = await this.judgeAssignmentRepository.create({
      hackathon: hackathonId,

      judge: judgeId,

      assignedBy: adminId,
    });

    this.logger.info(
      {
        hackathonId,
        judgeId,
        adminId,
      },
      "Judge assigned"
    );

    return assignment;
  }

  async getHackathonJudges({ hackathonId, adminId, isController }) {
    const hackathon = await this.hackathonRepository.getById(hackathonId);

    if (!hackathon) {
      throw new NotFoundError("Hackathon not found");
    }

    const canView =
      isController ||
      hackathon.createdBy?._id?.toString() === adminId.toString();

    if (!canView) {
      throw new ForbiddenError("Unauthorized");
    }

    return this.judgeAssignmentRepository.getHackathonJudges(hackathonId);
  }

  async removeJudge({ hackathonId, judgeId, adminId, isController }) {
    const hackathon = await this.hackathonRepository.getById(hackathonId);

    if (!hackathon) {
      throw new NotFoundError("Hackathon not found");
    }

    const canManage =
      isController ||
      hackathon.createdBy?._id?.toString() === adminId.toString();
      
    if (!canManage) {
      throw new ForbiddenError("Unauthorized");
    }

    const assignment = await this.judgeAssignmentRepository.findJudgeAssignment(
      hackathonId,
      judgeId
    );

    if (!assignment) {
      throw new NotFoundError("Judge assignment not found");
    }

    await this.judgeAssignmentRepository.removeJudge(hackathonId, judgeId);

    this.logger.info(
      {
        hackathonId,
        judgeId,
        adminId,
      },
      "Judge removed"
    );

    return {
      success: true,
      message: "Judge removed successfully",
    };
  }

  async getAssignedHackathons(judgeId) {
    return this.judgeAssignmentRepository.getJudgeHackathons(judgeId);
  }
}
