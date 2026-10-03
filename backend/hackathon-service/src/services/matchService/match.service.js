import mongoose from "mongoose";
import { BadRequestError } from "../../errors/BadRequestError.js";
import { NotFoundError } from "../../errors/NotFoundError.js";
import { ForbiddenError } from "../../errors/ForbiddenError.js";
import { ConflictError } from "../../errors/ConflictError.js";
import { buildStandings } from "../../utils/matchStandings.js";

export class MatchService {
  constructor(
    matchRepository,
    hackathonRepository,
    teamRepository,
    adminRepository,
    logger,
    notificationClient,
    userRepository
  ) {
    this.matchRepository = matchRepository;
    this.hackathonRepository = hackathonRepository;
    this.teamRepository = teamRepository;
    this.adminRepository = adminRepository;
    this.logger = logger;
    this.notificationClient = notificationClient;
    this.userRepository = userRepository;
  }

  async assertAdminAccess(hackathon, adminId) {
    const ownerId = hackathon.createdBy._id
      ? hackathon.createdBy._id.toString()
      : hackathon.createdBy.toString();
    const isOwner = ownerId === adminId.toString();

    if (isOwner) return;

    const admin = await this.adminRepository.getById(adminId);

    if (!admin?.controller) {
      throw new ForbiddenError("Unauthorized");
    }
  }

  getMatchRoundPhase(hackathon, phaseId) {
    const phase = (hackathon.phases || []).find(
      (p) => p._id.toString() === phaseId.toString()
    );

    if (!phase || phase.phaseType !== "MATCH_ROUND") {
      throw new BadRequestError("Invalid match round");
    }

    return phase;
  }

  async notifyTeam(team, { title, message, type, actionUrl, metadata }) {
    const recipients = [team.leader, ...(team.members || [])].filter(Boolean);

    await Promise.all(
      recipients.map((userId) =>
        this.notificationClient.createNotification({
          userId,
          title,
          message,
          type,
          actionUrl,
          metadata,
        })
      )
    );
  }

  async createMatch({
    hackathonId,
    adminId,
    phaseId,
    teamA,
    teamB,
    order,
    scheduledAt,
  }) {
    if (
      !mongoose.Types.ObjectId.isValid(hackathonId) ||
      !mongoose.Types.ObjectId.isValid(phaseId) ||
      !mongoose.Types.ObjectId.isValid(teamA) ||
      !mongoose.Types.ObjectId.isValid(teamB)
    ) {
      throw new BadRequestError("Invalid id");
    }

    if (teamA === teamB) {
      throw new BadRequestError("A team cannot be matched against itself");
    }

    const hackathon = await this.hackathonRepository.getById(hackathonId);

    if (!hackathon) {
      throw new NotFoundError("Event not found");
    }

    if (hackathon.eventFormat !== "ON_SPOT") {
      throw new BadRequestError("This event is not an on-spot event");
    }

    await this.assertAdminAccess(hackathon, adminId);

    const phase = this.getMatchRoundPhase(hackathon, phaseId);

    const teams = await this.teamRepository.getTeamsByHackathon(hackathonId);
    const teamIds = new Set(teams.map((t) => t._id.toString()));

    if (!teamIds.has(teamA.toString()) || !teamIds.has(teamB.toString())) {
      throw new BadRequestError("Both teams must belong to this event");
    }

    const [existingA, existingB] = await Promise.all([
      this.matchRepository.findUnresolvedForTeamInPhase(
        hackathonId,
        phaseId,
        teamA
      ),
      this.matchRepository.findUnresolvedForTeamInPhase(
        hackathonId,
        phaseId,
        teamB
      ),
    ]);

    if (existingA || existingB) {
      throw new ConflictError(
        "One of these teams is already in an unresolved match this round"
      );
    }

    const createdMatch = await this.matchRepository.create({
      hackathon: hackathonId,
      phaseId,
      teamA,
      teamB,
      order: order || 0,
      scheduledAt: scheduledAt || null,
    });

    const teamADoc = teams.find((t) => t._id.toString() === teamA.toString());
    const teamBDoc = teams.find((t) => t._id.toString() === teamB.toString());

    await Promise.all([
      this.notifyTeam(teamADoc, {
        title: "Match Scheduled",
        message: `You've been paired against ${teamBDoc.name} in ${phase.phaseName} of ${hackathon.title}.`,
        type: "TEAM",
        actionUrl: `/hackathon/${hackathon.slug}`,
        metadata: {
          hackathonId: hackathonId.toString(),
          matchId: createdMatch._id.toString(),
        },
      }),
      this.notifyTeam(teamBDoc, {
        title: "Match Scheduled",
        message: `You've been paired against ${teamADoc.name} in ${phase.phaseName} of ${hackathon.title}.`,
        type: "TEAM",
        actionUrl: `/hackathon/${hackathon.slug}`,
        metadata: {
          hackathonId: hackathonId.toString(),
          matchId: createdMatch._id.toString(),
        },
      }),
    ]);

    return createdMatch;
  }

  async updateMatchScore({ hackathonId, adminId, matchId, scoreA, scoreB, winner }) {
    if (
      !mongoose.Types.ObjectId.isValid(hackathonId) ||
      !mongoose.Types.ObjectId.isValid(matchId)
    ) {
      throw new BadRequestError("Invalid id");
    }

    if (typeof scoreA !== "number" || typeof scoreB !== "number") {
      throw new BadRequestError("Both scores are required");
    }

    const hackathon = await this.hackathonRepository.getById(hackathonId);

    if (!hackathon) {
      throw new NotFoundError("Event not found");
    }

    await this.assertAdminAccess(hackathon, adminId);

    const match = await this.matchRepository.findById(matchId);

    if (!match || match.hackathon.toString() !== hackathonId.toString()) {
      throw new NotFoundError("Match not found");
    }

    if (match.status === "COMPLETED") {
      throw new BadRequestError("This match has already been completed");
    }

    let resolvedWinner;

    if (scoreA === scoreB) {
      if (
        !winner ||
        ![match.teamA._id.toString(), match.teamB._id.toString()].includes(
          winner.toString()
        )
      ) {
        throw new BadRequestError(
          "Tied score requires an explicit winner to be picked"
        );
      }
      resolvedWinner = winner;
    } else {
      resolvedWinner =
        scoreA > scoreB ? match.teamA._id.toString() : match.teamB._id.toString();
    }

    const updated = await this.matchRepository.updateScore(matchId, {
      scoreA,
      scoreB,
      winner: resolvedWinner,
    });

    const winnerTeam =
      resolvedWinner === match.teamA._id.toString() ? match.teamA : match.teamB;
    const loserTeam =
      resolvedWinner === match.teamA._id.toString() ? match.teamB : match.teamA;

    await Promise.all([
      this.notifyTeam(winnerTeam, {
        title: "Match Won",
        message: `${winnerTeam.name} won against ${loserTeam.name} in ${hackathon.title}!`,
        type: "RESULT",
        actionUrl: `/hackathon/${hackathon.slug}`,
        metadata: { hackathonId: hackathonId.toString(), matchId: matchId.toString() },
      }),
      this.notifyTeam(loserTeam, {
        title: "Match Result",
        message: `${loserTeam.name} lost to ${winnerTeam.name} in ${hackathon.title}.`,
        type: "RESULT",
        actionUrl: `/hackathon/${hackathon.slug}`,
        metadata: { hackathonId: hackathonId.toString(), matchId: matchId.toString() },
      }),
    ]);

    // Results email only for the FINAL round's match — both teams that made
    // it there, not every team eliminated earlier in the bracket.
    const matchRoundPhases = (hackathon.phases || [])
      .filter((p) => p.phaseType === "MATCH_ROUND")
      .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    const finalPhase = matchRoundPhases[matchRoundPhases.length - 1];
    const isFinalRound =
      finalPhase && finalPhase._id.toString() === match.phaseId.toString();

    if (isFinalRound) {
      const finalists = [winnerTeam, loserTeam].flatMap((team) => [
        team.leader,
        ...(team.members || []),
      ]);

      await Promise.all(
        finalists.map(async (userId) => {
          const recipient = await this.userRepository.getById(userId);
          if (!recipient?.email) return;

          await this.notificationClient.sendEmail({
            type: "results-announcement",
            user: { email: recipient.email, name: recipient.name },
            hackathon: {
              hackathonName: hackathon.title,
              hackathonLink: `${process.env.FRONTEND_URL}/hackathon/${hackathon.slug}/bracket`,
            },
          });
        })
      );
    }

    return updated;
  }

  async updateMatchStatus({ hackathonId, adminId, matchId, status }) {
    if (
      !mongoose.Types.ObjectId.isValid(hackathonId) ||
      !mongoose.Types.ObjectId.isValid(matchId)
    ) {
      throw new BadRequestError("Invalid id");
    }

    if (status !== "LIVE") {
      throw new BadRequestError(
        "Only a transition to LIVE is allowed here — completion happens via score entry"
      );
    }

    const hackathon = await this.hackathonRepository.getById(hackathonId);

    if (!hackathon) {
      throw new NotFoundError("Event not found");
    }

    await this.assertAdminAccess(hackathon, adminId);

    const match = await this.matchRepository.findById(matchId);

    if (!match || match.hackathon.toString() !== hackathonId.toString()) {
      throw new NotFoundError("Match not found");
    }

    if (match.status !== "SCHEDULED") {
      throw new BadRequestError("Only a scheduled match can be marked live");
    }

    const updated = await this.matchRepository.updateStatus(matchId, "LIVE");

    await Promise.all([
      this.notifyTeam(match.teamA, {
        title: "You're Up!",
        message: `Your match against ${match.teamB.name} is now live in ${hackathon.title}.`,
        type: "TEAM",
        actionUrl: `/hackathon/${hackathon.slug}`,
        metadata: { hackathonId: hackathonId.toString(), matchId: matchId.toString() },
      }),
      this.notifyTeam(match.teamB, {
        title: "You're Up!",
        message: `Your match against ${match.teamA.name} is now live in ${hackathon.title}.`,
        type: "TEAM",
        actionUrl: `/hackathon/${hackathon.slug}`,
        metadata: { hackathonId: hackathonId.toString(), matchId: matchId.toString() },
      }),
    ]);

    return updated;
  }

  async updateSchedule({ hackathonId, adminId, matchId, scheduledAt }) {
    const hackathon = await this.hackathonRepository.getById(hackathonId);

    if (!hackathon) {
      throw new NotFoundError("Event not found");
    }

    await this.assertAdminAccess(hackathon, adminId);

    const match = await this.matchRepository.findById(matchId);

    if (!match || match.hackathon.toString() !== hackathonId.toString()) {
      throw new NotFoundError("Match not found");
    }

    if (match.status === "COMPLETED") {
      throw new BadRequestError("This match has already been completed");
    }

    const previousTime = match.scheduledAt
      ? new Date(match.scheduledAt).getTime()
      : null;
    const nextTime = scheduledAt ? new Date(scheduledAt).getTime() : null;
    const isNewOrChangedNonNull = nextTime != null && nextTime !== previousTime;

    const updated = await this.matchRepository.updateSchedule(
      matchId,
      scheduledAt || null
    );

    if (isNewOrChangedNonNull) {
      const scheduledLabel = new Date(scheduledAt).toLocaleString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "short",
        hour: "numeric",
        minute: "2-digit",
      });

      await Promise.all([
        this.notifyTeam(match.teamA, {
          title: "Match Time Set",
          message: `Your match against ${match.teamB.name} in ${hackathon.title} is scheduled for ${scheduledLabel}.`,
          type: "TEAM",
          actionUrl: `/hackathon/${hackathon.slug}`,
          metadata: {
            hackathonId: hackathonId.toString(),
            matchId: matchId.toString(),
          },
        }),
        this.notifyTeam(match.teamB, {
          title: "Match Time Set",
          message: `Your match against ${match.teamA.name} in ${hackathon.title} is scheduled for ${scheduledLabel}.`,
          type: "TEAM",
          actionUrl: `/hackathon/${hackathon.slug}`,
          metadata: {
            hackathonId: hackathonId.toString(),
            matchId: matchId.toString(),
          },
        }),
      ]);
    }

    return updated;
  }

  async reorderMatches({ hackathonId, adminId, phaseId, orderedMatchIds }) {
    const hackathon = await this.hackathonRepository.getById(hackathonId);

    if (!hackathon) {
      throw new NotFoundError("Event not found");
    }

    await this.assertAdminAccess(hackathon, adminId);

    const matches = await this.matchRepository.findByRound(hackathonId, phaseId);
    const validIds = new Set(matches.map((m) => m._id.toString()));

    for (const id of orderedMatchIds) {
      if (!validIds.has(id.toString())) {
        throw new BadRequestError("Invalid match id in reorder list");
      }
    }

    return this.matchRepository.bulkReorder(
      orderedMatchIds.map((matchId, index) => ({ matchId, order: index }))
    );
  }

  async deleteMatch({ hackathonId, adminId, matchId }) {
    const hackathon = await this.hackathonRepository.getById(hackathonId);

    if (!hackathon) {
      throw new NotFoundError("Event not found");
    }

    await this.assertAdminAccess(hackathon, adminId);

    const deleted = await this.matchRepository.deleteById(matchId);

    if (!deleted) {
      throw new BadRequestError(
        "Match not found, or it has already been completed"
      );
    }

    return deleted;
  }

  async getRoundMatches({ hackathonId, phaseId }) {
    if (
      !mongoose.Types.ObjectId.isValid(hackathonId) ||
      !mongoose.Types.ObjectId.isValid(phaseId)
    ) {
      throw new BadRequestError("Invalid id");
    }

    return this.matchRepository.findByRound(hackathonId, phaseId);
  }

  async getStandings({ hackathonId }) {
    if (!mongoose.Types.ObjectId.isValid(hackathonId)) {
      throw new BadRequestError("Invalid event id");
    }

    const hackathon = await this.hackathonRepository.getById(hackathonId);

    if (!hackathon) {
      throw new NotFoundError("Event not found");
    }

    const [teams, matches] = await Promise.all([
      this.teamRepository.getTeamsByHackathon(hackathonId),
      this.matchRepository.findAllForHackathon(hackathonId),
    ]);

    return buildStandings({ hackathon, teams, matches });
  }
}
