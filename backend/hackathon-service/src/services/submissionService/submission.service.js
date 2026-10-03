import mongoose from "mongoose";
import { BadRequestError } from "../../errors/BadRequestError.js";
import { NotFoundError } from "../../errors/NotFoundError.js";
import { ForbiddenError } from "../../errors/ForbiddenError.js";
import { getLifecycleStatus } from "../../utils/lifecycleStatus.js";
import { buildWeightedLeaderboard } from "../../utils/weightedLeaderboard.js";
import { validateSubmissionData } from "../../utils/validateSubmissionData.js";
import { getNowUTC } from "../../utils/dateUtils.js";
import { assertProfileComplete } from "../../utils/profileCompleteness.js";

export class SubmissionService {
  constructor(
    submissionRepository,
    hackathonRepository,
    teamRepository,
    registrationRepository,
    mediaServiceClient,
    cacheService,
    notificationClient,
    logger,
    submissionReviewRepository,
    userRepository
  ) {
    this.submissionRepository = submissionRepository;
    this.hackathonRepository = hackathonRepository;
    this.teamRepository = teamRepository;
    this.registrationRepository = registrationRepository;
    this.mediaServiceClient = mediaServiceClient,
    this.cacheService = cacheService;
    this.notificationClient = notificationClient,
    this.logger = logger;
    this.submissionReviewRepository = submissionReviewRepository;
    this.userRepository = userRepository;
  }

  async getHackathonResults(hackathonId) {
    if (!mongoose.Types.ObjectId.isValid(hackathonId)) {
      throw new BadRequestError("Invalid event id");
    }

    const hackathon = await this.hackathonRepository.getResultVisibility(
      hackathonId
    );

    if (!hackathon) {
      throw new NotFoundError("Event not found");
    }

    if (getLifecycleStatus(hackathon) !== "COMPLETED") {
      throw new ForbiddenError("Results are not available yet");
    }

    if (!hackathon.showResult) {
      throw new ForbiddenError("Results are not public");
    }

    const submissions = await this.submissionRepository.getHackathonSubmissions(
      hackathonId
    );

    const leaderboard = buildWeightedLeaderboard({ hackathon, submissions });

    if (hackathon.publicLeaderboardLimit) {
      return leaderboard.slice(0, hackathon.publicLeaderboardLimit);
    }

    return leaderboard;
  }

  async createSubmission({
    userId,
    hackathonId,
    title,
    description,
    submissionData,
  }) {
    if (!mongoose.Types.ObjectId.isValid(hackathonId)) {
      throw new BadRequestError("Invalid event id");
    }

    await assertProfileComplete(this.userRepository, userId);

    if (!title?.trim()) {
      throw new BadRequestError("Submission title is required.");
    }

    if (!description?.trim()) {
      throw new BadRequestError("Provide a description for your submission.");
    }

    if (!submissionData || typeof submissionData !== "object") {
      throw new BadRequestError("Submission data is required.");
    }

    const currentTime = getNowUTC();

    const hackathon = await this.hackathonRepository.getActiveSubmissionPhase(
      hackathonId,
      currentTime
    );

    if (!hackathon) {
      throw new BadRequestError(
        "Seems like there is no active submission phase for this event"
      );
    }

    const activePhase = hackathon.phases[0];

    const registration =
      await this.registrationRepository.findByUserAndHackathon(
        userId,
        hackathonId
      );

    if (!registration) {
      throw new BadRequestError(
        "Kindly register for the event before submitting"
      );
    }

    validateSubmissionData(submissionData, activePhase.submissionForm);

    let participant = null;
    let team = null;
    let teamDoc = null;

    if (hackathon.participationType === "TEAM") {
      if (!registration.team) {
        throw new BadRequestError(
          "This event requires team participation. Kindly join a team before submitting"
        );
      }

      teamDoc = await this.teamRepository.findById(registration.team);

      if (!teamDoc) {
        throw new NotFoundError(
          "Seems like your team details are missing. Kindly contact support"
        );
      }

      if (teamDoc.leader.toString() !== userId.toString()) {
        throw new ForbiddenError(
          "Submission can only be made by the team leader"
        );
      }

      const existingSubmission =
        await this.submissionRepository.findByTeamAndPhase(
          teamDoc._id,
          hackathonId,
          activePhase._id
        );

      if (existingSubmission) {
        throw new BadRequestError("Submission already exists for this phase");
      }

      team = teamDoc._id;
    } else {
      const existingSubmission =
        await this.submissionRepository.findByParticipantAndPhase(
          userId,
          hackathonId,
          activePhase._id
        );

      if (existingSubmission) {
        throw new BadRequestError("Submission already exists for this phase");
      }

      participant = userId;
    }

    // Prerequisite-round gating: block submitting to a later round unless
    // the entity qualified out of the immediately preceding SUBMISSION
    // phase. Phase order (not a separate "order" field) is already this
    // codebase's convention for sequencing rounds.
    const phaseData = await this.hackathonRepository.getPhases(hackathonId);
    const submissionPhases = (phaseData?.phases || []).filter(
      (phase) => phase.phaseType === "SUBMISSION"
    );
    const activeIndex = submissionPhases.findIndex(
      (phase) => phase._id.toString() === activePhase._id.toString()
    );
    const prereqPhase =
      activeIndex > 0 ? submissionPhases[activeIndex - 1] : null;

    if (prereqPhase) {
      const prereqSubmission = team
        ? await this.submissionRepository.findByTeamAndPhase(
            team,
            hackathonId,
            prereqPhase._id
          )
        : await this.submissionRepository.findByParticipantAndPhase(
            userId,
            hackathonId,
            prereqPhase._id
          );

      if (!prereqSubmission) {
        throw new BadRequestError(
          `You didn't submit to ${prereqPhase.phaseName}, so you can't submit to this round.`
        );
      }

      if (prereqSubmission.qualificationStatus === "ELIMINATED") {
        throw new ForbiddenError(
          `You did not qualify for ${activePhase.phaseName} based on your ${prereqPhase.phaseName} results.`
        );
      }

      if (prereqSubmission.qualificationStatus === "PENDING") {
        throw new BadRequestError(
          `Results for ${prereqPhase.phaseName} haven't been finalized yet. Check back once qualification is confirmed.`
        );
      }
    }

    try {
      const submission = await this.submissionRepository.create({
        participant,
        team,
        hackathon: hackathonId,
        phaseId: activePhase._id,
        title: title.trim(),
        description: description.trim(),
        submissionData,
      });

      let usersToNotify = [];

      if (hackathon.participationType === "TEAM") {
        usersToNotify = [teamDoc.leader, ...teamDoc.members];
      } else {
        usersToNotify = [userId];
      }

      for (const memberId of usersToNotify) {
        await this.notificationClient.createNotification({
          userId: memberId,
          title: "Submission Successful",
          message:
            hackathon.participationType === "TEAM"
              ? `${teamDoc.name} submitted successfully for ${hackathon.title}.`
              : `Your submission for ${hackathon.title} has been received.`,
          type: "SUBMISSION",
          actionUrl: `/submissions/${submission._id}`,
          metadata: {
            submissionId: submission._id.toString(),
            hackathonId: hackathon._id.toString(),
          },
        });

        const member = await this.userRepository.getById(memberId);
        if (member?.email) {
          await this.notificationClient.sendEmail({
            type: "submission-confirmation",
            user: { email: member.email, name: member.name },
            hackathon: {
              hackathonName: hackathon.title,
              hackathonLink: `${process.env.FRONTEND_URL}/hackathon/${hackathon.slug}`,
            },
          });
        }
      }

      this.logger.info(
        {
          submissionId: submission._id,
          hackathonId,
          phaseId: activePhase._id,
          userId,
        },
        "Submission created"
      );

      return {
        success: true,
        message: "Submission created successfully",
        submission,
      };
    } catch (error) {
      if (error.code === 11000) {
        throw new BadRequestError("Submission already exists for this phase");
      }

      throw error;
    }
  }

  async getMySubmissions(userId, hackathonId) {
    if (!mongoose.Types.ObjectId.isValid(hackathonId)) {
      throw new BadRequestError("Invalid event id");
    }

    const registration =
      await this.registrationRepository.findByUserAndHackathon(
        userId,
        hackathonId
      );

    if (!registration) {
      throw new NotFoundError("Registration not found");
    }

    const hackathon = await this.hackathonRepository.getPhases(hackathonId);

    if (!hackathon) {
      throw new NotFoundError("Event not found");
    }

    let submissions;

    if (hackathon.participationType === "TEAM") {
      if (!registration.team) {
        throw new NotFoundError("Team not found");
      }

      submissions = await this.submissionRepository.getMyTeamSubmissions(
        registration.team,
        hackathonId
      );
    } else {
      submissions = await this.submissionRepository.getMyIndividualSubmissions(
        userId,
        hackathonId
      );
    }

    const submissionMap = new Map();

    submissions.forEach((submission) => {
      if (!submission.phaseId) return;
      submissionMap.set(submission.phaseId.toString(), submission);
    });

    const now = new Date();

    const phases = hackathon.phases
      .filter((phase) => phase?._id && phase.phaseType === "SUBMISSION")
      .map((phase) => {
        const existing = submissionMap.get(phase._id.toString());

        let canSubmit = false;

        if (phase.phaseType === "SUBMISSION" && phase.isActive) {
          canSubmit = now >= phase.startDate && now <= phase.endDate;
        }

        return {
          phaseId: phase._id,
          phaseName: phase.phaseName,
          phaseType: phase.phaseType,
          submitted: !!existing,
          submissionId: existing?._id || null,
          submittedAt: existing?.submittedAt || null,
          canSubmit,
          qualificationStatus: existing?.qualificationStatus || null,
          resultAvailable: existing?.resultAvailable || false,
          averageScore: existing?.resultAvailable
            ? existing?.averageScore
            : null,
          reviewCount: existing?.reviewCount || 0,
        };
      });

    return {
      phases,
    };
  }

  async deleteReplacedFiles(oldSubmissionData, newSubmissionData) {
    if (!oldSubmissionData || !newSubmissionData) {
      return;
    }

    for (const field of Object.keys(oldSubmissionData)) {
      const oldValue = oldSubmissionData[field];

      const newValue = newSubmissionData[field];

      if (!oldValue || !newValue) {
        continue;
      }

      if (oldValue?.key && newValue?.key && oldValue.key !== newValue.key) {
        await this.mediaServiceClient.deleteFile(oldValue.key);
      }

      if (Array.isArray(oldValue) && Array.isArray(newValue)) {
        const newKeys = new Set(
          newValue.filter((f) => f?.key).map((f) => f.key)
        );

        for (const file of oldValue) {
          if (file?.key && !newKeys.has(file.key)) {
            await this.mediaServiceClient.deleteFile(file.key);
          }
        }
      }
    }
  }

  async updateSubmission({
    userId,
    hackathonId,
    submissionId,
    title,
    description,
    submissionData,
  }) {
    if (!mongoose.Types.ObjectId.isValid(hackathonId)) {
      throw new BadRequestError("Invalid event id");
    }

    const submission = await this.submissionRepository.findById(submissionId);

    if (!submission) {
      throw new NotFoundError("Submission not found");
    }

    if (submission.hackathon.toString() !== hackathonId) {
      throw new ForbiddenError("Unauthorized");
    }

    const currentTime = new Date();

    const hackathon = await this.hackathonRepository.getActiveSubmissionPhase(
      hackathonId,
      currentTime
    );

    if (!hackathon) {
      throw new ForbiddenError("Submission phase is closed");
    }

    const activePhase = hackathon.phases[0];

    if (String(submission.phaseId) !== String(activePhase?._id)) {
      throw new ForbiddenError("Submission phase is closed");
    }

    const registration =
      await this.registrationRepository.findByUserAndHackathon(
        userId,
        hackathonId
      );

    if (!registration) {
      throw new NotFoundError("Registration not found");
    }

    if (hackathon.participationType === "TEAM") {
      const team = await this.teamRepository.findById(registration.team);

      if (!team) {
        throw new NotFoundError("Team not found");
      }

      if (team.leader.toString() !== userId.toString()) {
        throw new ForbiddenError("Only team leader can update submission");
      }

      if (submission.team.toString() !== team._id.toString()) {
        throw new ForbiddenError("Unauthorized");
      }
    } else {
      if (submission.participant.toString() !== userId.toString()) {
        throw new ForbiddenError("Unauthorized");
      }
    }

    if (!title?.trim()) {
      throw new BadRequestError("Title is required");
    }

    if (!description?.trim()) {
      throw new BadRequestError("Description is required");
    }

    if (!submissionData || typeof submissionData !== "object") {
      throw new BadRequestError("Submission data is required");
    }

    validateSubmissionData(submissionData, activePhase.submissionForm);

    await this.deleteReplacedFiles(submission.submissionData, submissionData);

    const updatedSubmission = await this.submissionRepository.update(
      submissionId,
      {
        title: title.trim(),

        description: description.trim(),

        submissionData,
      }
    );

    this.logger.info(
      {
        submissionId,
        userId,
        hackathonId,
      },
      "Submission updated"
    );

    return {
      success: true,
      message: "Submission updated successfully",
      submission: updatedSubmission,
    };
  }

  async getSubmissionById(submissionId, userId) {
    if (!mongoose.Types.ObjectId.isValid(submissionId)) {
      throw new BadRequestError("Invalid submission id");
    }

    const submissionDoc = await this.submissionRepository.getSubmissionById(
      submissionId
    );

    if (!submissionDoc) {
      throw new NotFoundError("Submission not found");
    }

    // Individual submission
    if (submissionDoc.participant) {
      if (submissionDoc.participant._id.toString() !== userId.toString()) {
        throw new ForbiddenError("Access denied");
      }
    } else if (submissionDoc.team) {
      // Team submission
      const team = await this.teamRepository.findById(submissionDoc.team._id);

      if (!team) {
        throw new NotFoundError("Team not found");
      }

      const isLeader = team.leader.toString() === userId.toString();

      const isMember = team.members.some(
        (memberId) => memberId.toString() === userId.toString()
      );

      if (!isLeader && !isMember) {
        throw new ForbiddenError("Access denied");
      }
    } else {
      throw new ForbiddenError("Access denied");
    }

    const submission = submissionDoc.toObject({ flattenMaps: true });

    // Score/feedback for THIS round becomes visible the moment every judge
    // assigned to the hackathon has reviewed it (resultAvailable, set in
    // submissionReview.service.js) — fully automatic, per round, and
    // independent of the hackathon-wide showResult flag, which now governs
    // only the full comparative leaderboard, not an entity's own score.
    // qualificationStatus and reviewCount are never gated — neither is a
    // judge's numeric score/feedback. An entity needs qualificationStatus
    // to know if they can submit to the next round, and reviewCount lets
    // the UI show "being reviewed" instead of leaving the score silently
    // blank while judging is still in progress.
    if (submission.resultAvailable) {
      submission.reviews =
        await this.submissionReviewRepository.getPublicReviewsForSubmission(
          submissionId
        );
    } else {
      delete submission.averageScore;
      delete submission.resultStatus;
      delete submission.hackathonPoints;
      submission.reviews = [];
    }

    return submission;
  }
}
