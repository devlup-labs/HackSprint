import mongoose from "mongoose";
import { BadRequestError } from "../../errors/BadRequestError.js";
import { NotFoundError } from "../../errors/NotFoundError.js";
import { ForbiddenError } from "../../errors/ForbiddenError.js";
import { REDIS_KEYS } from "../../config/redisKeys.js";

export class SubmissionReviewService {
  constructor(
    submissionReviewRepository,
    submissionRepository,
    judgeAssignmentRepository,
    hackathonRepository,
    cacheService,
    logger,
    notificationClient,
    teamRepository
  ) {
    this.submissionReviewRepository = submissionReviewRepository;
    this.submissionRepository = submissionRepository;
    this.judgeAssignmentRepository = judgeAssignmentRepository;
    this.hackathonRepository = hackathonRepository;
    this.cacheService = cacheService;
    this.logger = logger;
    this.notificationClient = notificationClient;
    this.teamRepository = teamRepository;
  }

  async reviewSubmission({ submissionId, judgeId, score, feedback }) {
    if (!mongoose.Types.ObjectId.isValid(submissionId)) {
      throw new BadRequestError("Invalid submission id");
    }

    const submission = await this.submissionRepository.findById(submissionId);

    if (!submission) {
      throw new NotFoundError("Submission not found");
    }

    const hackathon = await this.hackathonRepository.getById(
      submission.hackathon
    );

    if (!hackathon) {
      throw new NotFoundError("Event not found");
    }

    const minScore = hackathon?.judgingConfig?.minScore ?? 0;

    const maxScore = hackathon?.judgingConfig?.maxScore ?? 100;

    if (typeof score !== "number" || score < minScore || score > maxScore) {
      throw new BadRequestError(
        `Score must be between ${minScore} and ${maxScore}`
      );
    }

    const assignment = await this.judgeAssignmentRepository.findJudgeAssignment(
      submission.hackathon,
      judgeId
    );

    if (!assignment) {
      throw new ForbiddenError("You are not assigned as a judge");
    }

    const existingReview =
      await this.submissionReviewRepository.findByJudgeAndSubmission(
        judgeId,
        submissionId
      );

    let review;

    if (existingReview) {
      review = await this.submissionReviewRepository.updateReview(
        existingReview._id,
        {
          score,
          feedback,
        }
      );
    } else {
      review = await this.submissionReviewRepository.create({
        submission: submissionId,

        hackathon: submission.hackathon,

        judge: judgeId,

        score,

        feedback,
      });
    }

    const aggregate =
      await this.submissionReviewRepository.getSubmissionAverage(
        submission._id
      );

    await this.submissionRepository.updateScoreStats(
      submission._id,
      aggregate.averageScore,
      aggregate.reviewCount
    );

    // Auto-reveal: the moment every judge assigned to this hackathon has
    // reviewed this specific submission, its score becomes visible on the
    // owner's own dashboard — no admin action needed, and independent of
    // the hackathon-wide release gate (which only governs the full
    // leaderboard). Guarded on the previous state so this only fires once.
    if (!submission.resultAvailable) {
      const judges = await this.judgeAssignmentRepository.getHackathonJudges(
        submission.hackathon
      );

      if (judges.length > 0 && aggregate.reviewCount >= judges.length) {
        await this.submissionRepository.update(submission._id, {
          resultAvailable: true,
        });

        const team = submission.team
          ? await this.teamRepository.findById(submission.team)
          : null;

        const recipientIds = team
          ? [team.leader, ...(team.members || [])].filter(Boolean)
          : submission.participant
          ? [submission.participant]
          : [];

        await Promise.all(
          recipientIds.map((userId) =>
            this.notificationClient.createNotification({
              userId,
              title: "Your Round Score Is Available",
              message: `Your submission for ${hackathon.title} has been fully reviewed. Check your dashboard for the score and feedback.`,
              type: "RESULT",
              actionUrl: `/submissions/${submission._id}`,
              metadata: {
                hackathonId: submission.hackathon.toString(),
                submissionId: submission._id.toString(),
                kind: "SCORE_AVAILABLE",
              },
            })
          )
        );
      }
    }

    try {
      await this.cacheService.del(
        REDIS_KEYS.RESULTS(submission.hackathon.toString())
      );
    } catch (error) {
      this.logger.error({ error }, "Failed to invalidate results cache");
    }

    this.logger.info(
      {
        submissionId,
        judgeId,
      },
      "Submission reviewed"
    );

    return review;
  }
}
