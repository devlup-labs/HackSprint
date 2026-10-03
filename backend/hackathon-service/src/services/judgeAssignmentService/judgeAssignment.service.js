import mongoose from "mongoose";
import { BadRequestError } from "../../errors/BadRequestError.js";
import { NotFoundError } from "../../errors/NotFoundError.js";
import { ForbiddenError } from "../../errors/ForbiddenError.js";

export class JudgeAssignmentService {
  constructor(
    judgeAssignmentRepository,
    hackathonRepository,
    adminRepository,
    logger,
    notificationClient
  ) {
    this.judgeAssignmentRepository = judgeAssignmentRepository;

    this.hackathonRepository = hackathonRepository;

    this.adminRepository = adminRepository;

    this.logger = logger;

    this.notificationClient = notificationClient;
  }

  async assignJudge({ hackathonId, judgeId, adminId, isController }) {
    if (!mongoose.Types.ObjectId.isValid(hackathonId)) {
      throw new BadRequestError("Invalid event id");
    }

    if (!mongoose.Types.ObjectId.isValid(judgeId)) {
      throw new BadRequestError("Invalid judge id");
    }

    const hackathon = await this.hackathonRepository.getById(hackathonId);

    if (!hackathon) {
      throw new NotFoundError("Event not found");
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

    if (judgeId.toString() === adminId.toString()) {
      throw new BadRequestError("You can't invite yourself — you already manage this event");
    }

    const existing = await this.judgeAssignmentRepository.findAnyAssignment(
      hackathonId,
      judgeId
    );

    if (existing?.status === "ACCEPTED") {
      throw new BadRequestError("Already a judge for this event");
    }

    if (existing?.status === "PENDING") {
      throw new BadRequestError("An invitation is already waiting for a reply");
    }

    const inviter = await this.adminRepository.getById(adminId);

    // A declined invitation can be sent again; reuse the row so the unique
    // (hackathon, judge) index stays satisfied.
    let assignment;
    if (existing) {
      existing.status = "PENDING";
      existing.respondedAt = null;
      existing.assignedBy = adminId;
      assignment = await existing.save();
    } else {
      assignment = await this.judgeAssignmentRepository.create({
        hackathon: hackathonId,
        judge: judgeId,
        assignedBy: adminId,
        status: "PENDING",
      });
    }

    await this.notificationClient.createNotification({
      userId: judgeId,
      title: "Judge invitation",
      message: `${inviter?.adminName || "An organizer"} invited you to judge "${hackathon.title}". Accept or decline from your dashboard.`,
      type: "SYSTEM",
      actionUrl: "/admin",
      metadata: { judgeInvitationId: assignment._id.toString(), hackathonId },
    });

    this.logger.info({ hackathonId, judgeId, adminId }, "Judge invited");

    return assignment;
  }

  async getHackathonJudges({ hackathonId, adminId, isController }) {
    const hackathon = await this.hackathonRepository.getById(hackathonId);

    if (!hackathon) {
      throw new NotFoundError("Event not found");
    }

    const canView =
      isController ||
      hackathon.createdBy?._id?.toString() === adminId.toString();

    if (!canView) {
      throw new ForbiddenError("Unauthorized");
    }

    return this.judgeAssignmentRepository.getHackathonJudges(hackathonId, { includeAll: true });
  }

  async removeJudge({ hackathonId, judgeId, adminId, isController }) {
    const hackathon = await this.hackathonRepository.getById(hackathonId);

    if (!hackathon) {
      throw new NotFoundError("Event not found");
    }

    const canManage =
      isController ||
      hackathon.createdBy?._id?.toString() === adminId.toString();
      
    if (!canManage) {
      throw new ForbiddenError("Unauthorized");
    }

    const assignment = await this.judgeAssignmentRepository.findAnyAssignment(
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

  async getMyInvitations(judgeId) {
    return this.judgeAssignmentRepository.getPendingInvitations(judgeId);
  }

  async respondToInvitation({ invitationId, judgeId, accept }) {
    if (!mongoose.Types.ObjectId.isValid(invitationId)) {
      throw new BadRequestError("Invalid invitation id");
    }

    const invitation = await this.judgeAssignmentRepository.findById(invitationId);

    if (!invitation || invitation.judge.toString() !== judgeId.toString()) {
      throw new NotFoundError("Invitation not found");
    }

    if (invitation.status !== "PENDING") {
      throw new BadRequestError("You've already replied to this invitation");
    }

    invitation.status = accept ? "ACCEPTED" : "DECLINED";
    invitation.respondedAt = new Date();
    await invitation.save();

    const [judge, hackathon] = await Promise.all([
      this.adminRepository.getById(judgeId),
      this.hackathonRepository.getById(invitation.hackathon),
    ]);

    await this.notificationClient.createNotification({
      userId: invitation.assignedBy,
      title: accept ? "Judge invitation accepted" : "Judge invitation declined",
      message: `${judge?.adminName || "An organizer"} ${accept ? "accepted" : "declined"} your invitation to judge "${hackathon?.title || "your hackathon"}".`,
      type: "SYSTEM",
      actionUrl: "/admin",
    });

    this.logger.info({ invitationId, judgeId, accept }, "Judge invitation answered");

    return {
      success: true,
      message: accept ? "You're now a judge for this event" : "Invitation declined",
      status: invitation.status,
    };
  }
}
