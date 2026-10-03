import mongoose from "mongoose";
import crypto from "crypto";
import { BadRequestError } from "../../errors/BadRequestError.js";
import { NotFoundError } from "../../errors/NotFoundError.js";
import { getNowUTC } from "../../utils/dateUtils.js";
import { getLifecycleStatus } from "../../utils/lifecycleStatus.js";
import { assertProfileComplete } from "../../utils/profileCompleteness.js";

export class TeamService {
  constructor(
    teamRepository,
    registrationRepository,
    userRepository,
    hackathonRepository,
    notificationClient,
    logger
  ) {
    this.teamRepository = teamRepository;
    this.registrationRepository = registrationRepository;
    this.userRepository = userRepository;
    this.hackathonRepository = hackathonRepository;
    this.notificationClient = notificationClient,
    this.logger = logger;
  }

  generateCode(length = 12) {
    return crypto
      .randomBytes(length)
      .toString("hex")
      .slice(0, length)
      .toUpperCase();
  }

  getRegistrationPhase(hackathon, now) {
    return hackathon.phases?.find(
      (phase) =>
        phase.phaseType === "REGISTRATION" &&
        phase.isActive &&
        now >= phase.startDate &&
        now <= phase.endDate
    );
  }

  ensureTeamModificationAllowed(hackathon) {
    if (getLifecycleStatus(hackathon) === "COMPLETED") {
      throw new BadRequestError("Team modifications are no longer allowed");
    }
  }

  async createTeam({ userId, hackathonId, teamName }) {
    if (!mongoose.Types.ObjectId.isValid(hackathonId)) {
      throw new BadRequestError("Invalid event id");
    }

    await assertProfileComplete(this.userRepository, userId);

    const hackathon = await this.hackathonRepository.getById(hackathonId);

    if (getLifecycleStatus(hackathon) === "COMPLETED") {
      throw new BadRequestError("Team modifications are no longer allowed");
    }

    const now = getNowUTC();

    const registrationPhase = this.getRegistrationPhase(hackathon, now);

    if (!registrationPhase) {
      throw new BadRequestError("Registration is closed");
    }

    if (!hackathon) {
      throw new NotFoundError(
        "Seems like the event you are trying to join does not exist"
      );
    }

    if (hackathon.participationType !== "TEAM") {
      throw new BadRequestError(
        "This event does not support team participation"
      );
    }

    const registration =
      await this.registrationRepository.findByUserAndHackathon(
        userId,
        hackathonId
      );

    if (!registration) {
      throw new BadRequestError(
        "Please register for the event before creating a team"
      );
    }

    if (registration.team) {
      throw new BadRequestError("You are already in a team for this event");
    }

    const existingTeam = await this.teamRepository.findByNameAndHackathon(
      teamName,
      hackathonId
    );

    if (existingTeam) {
      throw new BadRequestError("This team name is already taken");
    }

    let secretCode;
    let codeExists = true;

    while (codeExists) {
      secretCode = this.generateCode();
      codeExists = await this.teamRepository.findByCode(secretCode);
    }

    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      const team = await this.teamRepository.create(
        {
          name: teamName,
          leader: userId,
          hackathon: hackathonId,
          members: [],
          pendingMembers: [],
          secretCode,
          maxTeamSize: hackathon.maxTeamSize,
        },
        session
      );

      await this.registrationRepository.updateTeam(
        registration._id,
        team._id,
        session
      );

      await this.userRepository.addTeam(userId, hackathonId, team._id, session);

      await session.commitTransaction();

      this.logger.info(
        {
          userId,
          teamId: team._id,
          hackathonId,
        },
        "Team created"
      );

      return team;
    } catch (error) {
      await session.abortTransaction();

      throw error;
    } finally {
      session.endSession();
    }
  }

  async joinTeam({ userId, secretCode }) {
    if (!secretCode?.trim()) {
      throw new BadRequestError("Team code is required");
    }

    await assertProfileComplete(this.userRepository, userId);

    const team = await this.teamRepository.findByCode(secretCode.trim());

    if (!team) {
      throw new NotFoundError("The team with the provided code does not exist");
    }

    const hackathon = await this.hackathonRepository.getById(team.hackathon);

    if (!hackathon) {
      throw new NotFoundError(
        "The event you are trying to join does not exist"
      );
    }

    const now = getNowUTC();

    const registrationPhase = this.getRegistrationPhase(hackathon, now);

    if (!registrationPhase) {
      throw new BadRequestError("Registration is closed");
    }

    if (hackathon.participationType !== "TEAM") {
      throw new BadRequestError(
        "This event does not support team participation"
      );
    }

    const registration =
      await this.registrationRepository.findByUserAndHackathon(
        userId,
        team.hackathon
      );

    if (!registration) {
      throw new BadRequestError(
        "Please register for the event before joining a team"
      );
    }

    if (registration.team) {
      throw new BadRequestError("You are already in a team for this event");
    }

    const isPending = team.pendingMembers.some(
      (memberId) => memberId.toString() === userId.toString()
    );

    if (isPending) {
      throw new BadRequestError(
        "You have already requested to join this team. Please wait for the team leader to respond to your request."
      );
    }

    const isAlreadyMember = team.members.some(
      (memberId) => memberId.toString() === userId.toString()
    );

    if (isAlreadyMember) {
      throw new BadRequestError("You are already a member of this team");
    }

    if (team.members.length + 1 >= team.maxTeamSize) {
      throw new BadRequestError(
        "Unfortunately, this team is already full. Please join another team or create your own team."
      );
    }

    team.pendingMembers.push(userId);

    await this.teamRepository.save(team);

    await this.notificationClient.createNotification({
      userId: team.leader,
      title: "New Team Join Request",
      message: "Someone has requested to join your team.",
      type: "TEAM",
      actionUrl: `/teams/${team._id}`,
      metadata: {
        teamId: team._id.toString(),
        requesterId: userId.toString(),
      },
    });

    this.logger.info(
      {
        userId,
        teamId: team._id,
      },
      "Join request created"
    );

    return {
      success: true,
      message:
        "Your request to join the team has been sent to the team leader. They will review your request and respond accordingly.",
    };
  }

  async handleRequest({ leaderId, teamId, userId, action }) {
    if (!["accept", "reject"].includes(action)) {
      throw new BadRequestError("Invalid action");
    }

    const team = await this.teamRepository.findById(teamId);

    if (!team) {
      throw new NotFoundError(
        "Sorry, the team you are trying to manage does not exist"
      );
    }

    if (team.leader.toString() !== leaderId.toString()) {
      throw new BadRequestError("Only the team leader can manage requests");
    }

    const pendingIndex = team.pendingMembers.findIndex(
      (memberId) => memberId.toString() === userId.toString()
    );

    if (pendingIndex === -1) {
      throw new BadRequestError(
        "Seems like there is no pending request from this user"
      );
    }

    team.pendingMembers.splice(pendingIndex, 1);

    const hackathon = await this.hackathonRepository.getById(team.hackathon);

    this.ensureTeamModificationAllowed(hackathon);

    const now = getNowUTC();

    const registrationPhase = this.getRegistrationPhase(hackathon, now);

    if (!registrationPhase) {
      throw new BadRequestError("Registration is closed");
    }

    if (action === "reject") {
      await this.teamRepository.save(team);

      await this.notificationClient.createNotification({
        userId,
        title: "Team Join Request Rejected",
        message: `Your request to join ${team.name} was rejected.`,
        type: "TEAM",
        actionUrl: `/hackathon/${hackathon.slug}`,
        metadata: {
          teamId: team._id.toString(),
        },
      });

      return {
        success: true,
        message: "Request rejected successfully",
      };
    }

    const registration =
      await this.registrationRepository.findByUserAndHackathon(
        userId,
        team.hackathon
      );

    if (!registration) {
      throw new BadRequestError("The user is not registered for the event");
    }

    if (registration.team) {
      throw new BadRequestError(
        "The user is already in a team for this event"
      );
    }

    const currentTeamSize = team.members.length + 1;

    if (currentTeamSize >= team.maxTeamSize) {
      throw new BadRequestError(
        "Sorry, the team is already full. You cannot accept more members."
      );
    }

    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      const alreadyMember = team.members.some(
        (memberId) => memberId.toString() === userId.toString()
      );

      if (alreadyMember) {
        throw new BadRequestError("The user is already a member of the team");
      }

      team.members.push(userId);

      await this.teamRepository.save(team, session);

      await this.registrationRepository.updateTeam(
        registration._id,
        team._id,
        session
      );

      await this.userRepository.addTeam(
        userId,
        team.hackathon,
        team._id,
        session
      );

      await session.commitTransaction();
      await this.notificationClient.createNotification({
        userId,

        title: "Team Join Request Accepted",

        message: `You have been added to ${team.name}.`,

        type: "TEAM",

        actionUrl: `/hackathon/${hackathon.slug}/team/${team.secretCode}`,

        metadata: {
          teamId: team._id.toString(),
        },
      });
    } catch (error) {
      await session.abortTransaction();

      throw error;
    } finally {
      await session.endSession();
    }

    this.logger.info(
      {
        leaderId,
        userId,
        teamId,
      },
      "Join request accepted"
    );

    return {
      success: true,
      message: "Member added successfully",
    };
  }

  async getPendingRequests({ leaderId, teamId }) {
    const team = await this.teamRepository.findById(teamId);

    if (!team) {
      throw new NotFoundError("Team not found");
    }

    if (team.leader.toString() !== leaderId.toString()) {
      throw new BadRequestError("Only team leader can view requests");
    }

    const populatedTeam = await this.teamRepository.getPendingRequests(teamId);

    return populatedTeam.pendingMembers;
  }

  async getTeamById(teamId) {
    const team = await this.teamRepository.getTeamDetails(teamId);

    if (!team) {
      throw new NotFoundError(
        "Seems like the team you are trying to view does not exist"
      );
    }

    return team;
  }

  async searchTeamByCode(secretCode) {
    if (!secretCode?.trim()) {
      throw new BadRequestError(
        "Kindly provide the team code to search for the team"
      );
    }

    const team = await this.teamRepository.searchByCode(secretCode.trim());

    if (!team) {
      throw new NotFoundError(
        "Seems like the team with given code does not exist"
      );
    }

    return {
      id: team._id,
      name: team.name,
      code: team.secretCode,
      leader: {
        name: team.leader.name,
        email: team.leader.email,
      },
      membersCount: team.members.length + 1,
      maxTeamSize: team.maxTeamSize,
      hackathon: {
        title: team.hackathon.title,
      },
    };
  }

  async cancelJoinRequest({ userId, teamId }) {
    if (!mongoose.Types.ObjectId.isValid(teamId)) {
      throw new BadRequestError("Invalid team id");
    }

    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      const team = await this.teamRepository.findByIdWithSession(
        teamId,
        session
      );

      if (!team) {
        throw new NotFoundError("Team not found");
      }

      const pendingIndex = team.pendingMembers.findIndex(
        (memberId) => memberId.toString() === userId.toString()
      );

      if (pendingIndex === -1) {
        throw new BadRequestError("No pending request found");
      }

      team.pendingMembers.splice(pendingIndex, 1);

      await this.teamRepository.save(team, session);

      await session.commitTransaction();

      this.logger.info(
        {
          userId,
          teamId,
        },
        "Join request cancelled"
      );

      return {
        success: true,
        message: "Join request cancelled successfully",
      };
    } catch (error) {
      await session.abortTransaction();

      throw error;
    } finally {
      session.endSession();
    }
  }

  async leaveTeam({ userId, teamId }) {
    const team = await this.teamRepository.findById(teamId);

    if (!team) {
      throw new NotFoundError("Team not found");
    }

    if (team.leader.toString() === userId.toString()) {
      throw new BadRequestError("Team leader cannot leave the team");
    }

    const memberIndex = team.members.findIndex(
      (memberId) => memberId.toString() === userId.toString()
    );

    if (memberIndex === -1) {
      throw new BadRequestError("You are not a member of this team");
    }

    const hackathon = await this.hackathonRepository.getById(team.hackathon);

    if (!hackathon) {
      throw new NotFoundError("Event not found");
    }

    this.ensureTeamModificationAllowed(hackathon);

    const now = getNowUTC();

    const registrationPhase = this.getRegistrationPhase(hackathon, now);

    if (!registrationPhase) {
      throw new BadRequestError("Registration is closed");
    }

    const registration =
      await this.registrationRepository.findByUserAndHackathon(
        userId,
        team.hackathon
      );

    if (!registration) {
      throw new NotFoundError("Registration not found");
    }

    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      await this.removeMemberFromTeam({
        team,
        userId,
        session,
      });

      await session.commitTransaction();

      this.logger.info(
        {
          userId,
          teamId,
        },
        "User left team"
      );

      return {
        success: true,
        message: "You have left the team successfully",
      };
    } catch (error) {
      await session.abortTransaction();

      throw error;
    } finally {
      session.endSession();
    }
  }

  async removeMemberFromTeam({ team, userId, session }) {
    const memberIndex = team.members.findIndex(
      (memberId) => memberId.toString() === userId.toString()
    );

    if (memberIndex === -1) {
      throw new BadRequestError("User is not a member of this team");
    }

    const registration =
      await this.registrationRepository.findByUserAndHackathon(
        userId,
        team.hackathon
      );

    if (!registration) {
      throw new NotFoundError("Registration not found");
    }

    team.members.splice(memberIndex, 1);

    await this.teamRepository.save(team, session);

    await this.registrationRepository.removeTeam(registration._id, session);

    await this.userRepository.removeTeam(userId, team.hackathon, session);
  }

  async removeMember({ leaderId, teamId, userId }) {
    const team = await this.teamRepository.findById(teamId);

    if (!team) {
      throw new NotFoundError("Team not found");
    }

    if (team.leader.toString() !== leaderId.toString()) {
      throw new BadRequestError("Only the team leader can remove members");
    }

    if (team.leader.toString() === userId.toString()) {
      throw new BadRequestError("Leader cannot remove themselves");
    }

    const hackathon = await this.hackathonRepository.getById(team.hackathon);

    if (!hackathon) {
      throw new NotFoundError("Event not found");
    }

    this.ensureTeamModificationAllowed(hackathon);

    const now = getNowUTC();

    const registrationPhase = this.getRegistrationPhase(hackathon, now);

    if (!registrationPhase) {
      throw new BadRequestError("Registration is closed");
    }

    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      const transactionalTeam = await this.teamRepository.findByIdWithSession(
        teamId,
        session
      );

      await this.removeMemberFromTeam({
        team: transactionalTeam,
        userId,
        session,
      });

      await session.commitTransaction();

      await this.notificationClient.createNotification({
        userId,
        title: "Removed From Team",
        message: `You have been removed from ${team.name}.`,
        type: "TEAM",
        actionUrl: `/hackathon/${hackathon.slug}`,
        metadata: {
          teamId: team._id.toString(),
        },
      });

      return {
        success: true,
        message: "Member removed successfully",
      };
    } catch (error) {
      await session.abortTransaction();

      throw error;
    } finally {
      session.endSession();
    }
  }

  async updateTeam({ leaderId, teamId, teamName }) {
    if (!teamName?.trim()) {
      throw new BadRequestError("Team name is required");
    }

    const team = await this.teamRepository.findById(teamId);

    if (!team) {
      throw new NotFoundError("Team not found");
    }

    if (team.leader.toString() !== leaderId.toString()) {
      throw new BadRequestError("Only the team leader can edit the team");
    }

    const hackathon = await this.hackathonRepository.getById(team.hackathon);

    this.ensureTeamModificationAllowed(hackathon);

    if (!hackathon) {
      throw new NotFoundError("Event not found");
    }

    const now = getNowUTC();

    const registrationPhase = this.getRegistrationPhase(hackathon, now);

    if (!registrationPhase) {
      throw new BadRequestError("Registration is closed");
    }

    const existingTeam = await this.teamRepository.findByNameAndHackathon(
      teamName.trim(),
      team.hackathon
    );

    if (existingTeam && existingTeam._id.toString() !== teamId.toString()) {
      throw new BadRequestError("Team name already exists");
    }

    const updatedTeam = await this.teamRepository.updateTeamName(
      teamId,
      teamName.trim()
    );

    this.logger.info(
      {
        leaderId,
        teamId,
      },
      "Team name updated"
    );

    return updatedTeam;
  }

  async clearUserTeamRelation(userId, hackathonId, session) {
    const registration =
      await this.registrationRepository.findByUserAndHackathon(
        userId,
        hackathonId
      );

    if (registration) {
      await this.registrationRepository.removeTeam(registration._id, session);
    }

    await this.userRepository.removeTeam(userId, hackathonId, session);
  }

  async deleteTeam({ leaderId, teamId }) {
    const team = await this.teamRepository.findById(teamId);

    if (!team) {
      throw new NotFoundError("Team not found");
    }

    if (team.leader.toString() !== leaderId.toString()) {
      throw new BadRequestError("Only the team leader can delete the team");
    }

    const hackathon = await this.hackathonRepository.getById(team.hackathon);

    this.ensureTeamModificationAllowed(hackathon);

    if (!hackathon) {
      throw new NotFoundError("Event not found");
    }

    const now = getNowUTC();

    const registrationPhase = this.getRegistrationPhase(hackathon, now);

    if (!registrationPhase) {
      throw new BadRequestError("Registration is closed");
    }
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      const transactionalTeam = await this.teamRepository.findByIdWithSession(
        teamId,
        session
      );

      if (!transactionalTeam) {
        throw new NotFoundError("Team not found");
      }

      await this.clearUserTeamRelation(
        transactionalTeam.leader,
        transactionalTeam.hackathon,
        session
      );

      for (const memberId of transactionalTeam.members) {
        await this.clearUserTeamRelation(
          memberId,
          transactionalTeam.hackathon,
          session
        );
      }

      await this.teamRepository.deleteTeam(teamId, session);

      const membersToNotify = [
        transactionalTeam.leader,
        ...transactionalTeam.members,
      ];

      await session.commitTransaction();

      for (const memberId of membersToNotify) {
        await this.notificationClient.createNotification({
          userId: memberId,
          title: "Team Deleted",
          message: `${transactionalTeam.name} has been deleted.`,
          type: "TEAM",
          actionUrl: `/hackathon/${hackathon.slug}`,
          metadata: {
            teamId: transactionalTeam._id.toString(),
          },
        });
      }

      this.logger.info(
        {
          leaderId,
          teamId,
        },
        "Team deleted"
      );

      return {
        success: true,
        message: "Team deleted successfully",
      };
    } catch (error) {
      await session.abortTransaction();

      throw error;
    } finally {
      session.endSession();
    }
  }
}
