import mongoose from "mongoose";
import { NotFoundError } from "../../errors/NotFoundError.js";
import { BadRequestError } from "../../errors/BadRequestError.js";
import { REDIS_KEYS } from "../../config/redisKeys.js";
import { ForbiddenError } from "../../errors/ForbiddenError.js";
import { getLifecycleStatus } from "../../utils/lifecycleStatus.js";
import { buildWeightedLeaderboard } from "../../utils/weightedLeaderboard.js";
import { mapWithConcurrency } from "../../utils/concurrency.js";

export class HackathonService {
  constructor(
    hackathonRepository,
    submissionRepository,
    registrationRepository,
    adminRepository,
    logger,
    cacheService,
    mediaServiceClient,
    teamRepository,
    judgeAssignmentRepository,
    submissionReviewRepository,
    notificationClient,
    matchRepository,
    userRepository
  ) {
    this.hackathonRepository = hackathonRepository;
    this.submissionRepository = submissionRepository;
    this.registrationRepository = registrationRepository;
    this.adminRepository = adminRepository;
    this.logger = logger;
    this.cacheService = cacheService;
    this.mediaServiceClient = mediaServiceClient;
    this.teamRepository = teamRepository;
    this.judgeAssignmentRepository = judgeAssignmentRepository;
    this.submissionReviewRepository = submissionReviewRepository;
    this.notificationClient = notificationClient;
    this.matchRepository = matchRepository;
    this.userRepository = userRepository;
  }

  async deleteHackathonImage(hackathon, payload) {
    if (
      payload.image &&
      hackathon.image?.key &&
      payload.image.key !== hackathon.image.key
    ) {
      try {
        await this.mediaServiceClient.deleteFile(hackathon.image.key);
      } catch (error) {
        this.logger.error(
          {
            err: error,
            hackathonId: hackathon._id,
          },
          "Failed to delete old event image"
        );
      }
    }
  }

  async deleteRemovedGalleryImages(hackathon, payload) {
    if (!payload.gallery) {
      return;
    }

    const newKeys = new Set(
      payload.gallery.filter((img) => img?.key).map((img) => img.key)
    );

    for (const image of hackathon.gallery || []) {
      if (image?.key && !newKeys.has(image.key)) {
        try {
          await this.mediaServiceClient.deleteFile(image.key);
        } catch (error) {
          this.logger.error(
            {
              err: error,
              hackathonId: hackathon._id,
              key: image.key,
            },
            "Failed to delete gallery image"
          );
        }
      }
    }
  }

  async invalidatePublicCaches(hackathonId, slug = null) {
    try {
      const keys = [
        REDIS_KEYS.PUBLIC_HACKATHONS,
        REDIS_KEYS.HACKATHON(hackathonId),
      ];

      if (slug) {
        keys.push(REDIS_KEYS.HACKATHON_SLUG(slug));
      }

      await this.cacheService.delMany(keys);
    } catch (error) {
      this.logger.error({ error }, "Cache invalidation failed");
    }
  }

  async getHackathonById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestError("Invalid event id");
    }

    const cacheKey = REDIS_KEYS.HACKATHON(id);

    try {
      const cachedData = await this.cacheService.get(cacheKey);

      if (cachedData) {
        this.logger.info({ hackathonId: id }, "Event cache hit");

        return cachedData;
      }
    } catch (error) {
      this.logger.error({ error }, "Redis read failed");
    }

    this.logger.info({ hackathonId: id }, "Event cache miss");

    const hackathon = await this.hackathonRepository.getById(id);

    if (!hackathon) {
      throw new NotFoundError("Event not found");
    }

    try {
      await this.cacheService.set(cacheKey, hackathon, 300);
    } catch (error) {
      this.logger.error({ error }, "Redis write failed");
    }

    return hackathon;
  }

  async getHackathonGallery(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestError("Invalid event id");
    }

    const hackathon = await this.hackathonRepository.getGallery(id);

    if (!hackathon) {
      throw new NotFoundError("Event not found");
    }

    return hackathon.gallery || [];
  }

  async createHackathon({ adminId, payload }) {
    const admin = await this.adminRepository.getById(adminId);

    if (!admin) {
      throw new NotFoundError(
        "Seems like there isn't any account associated with this email"
      );
    }

    // Controllers do the verifying, so neither check applies to them.
    if (!admin.controller) {
      if (!admin.profileCompleted) {
        throw new ForbiddenError("Complete your profile to proceed");
      }

      if (!admin.isVerified || admin.verificationStatus !== "APPROVED") {
        throw new ForbiddenError("Organizer has not been verified yet");
      }

      if (!admin.verificationDocuments?.length) {
        throw new ForbiddenError(
          "Submit your organiser details and documents for verification before creating events"
        );
      }
    }

    const existingHackathon = await this.hackathonRepository.findByTitle(
      payload.title
    );

    if (existingHackathon) {
      throw new BadRequestError("Event with this title already exist");
    }

    if (payload.participationType === "TEAM" && payload.maxTeamSize < 2) {
      throw new BadRequestError("Team event must have maxTeamSize >= 2");
    }

    if (!payload.phases || payload.phases.length === 0) {
      throw new BadRequestError("At least one phase is required");
    }

    const createPayload = {
      image: payload.image,
      title: payload.title,
      subTitle: payload.subTitle,
      venue: payload.venue,
      description: payload.description,
      detailsContent: payload.detailsContent,

      category: payload.category,
      techStacks: payload.techStacks,
      gallery: payload.gallery,
      difficulty: payload.difficulty,

      contacts: payload.contacts,
      resources: payload.resources,
      faqs: payload.faqs,

      prizes: payload.prizes,

      votingConfig: payload.votingConfig,
      judgingConfig: payload.judgingConfig,

      showResult: payload.showResult,
      publicLeaderboardLimit: payload.publicLeaderboardLimit,

      registrationForm: payload.registrationForm,
      phases: payload.phases,

      participationType: payload.participationType,
      maxTeamSize: payload.maxTeamSize,
      eventFormat: payload.eventFormat,

      tags: payload.tags,

      createdBy: adminId,

      status: "DRAFT",
    };

    Object.keys(createPayload).forEach((key) => {
      if (createPayload[key] === undefined) {
        delete createPayload[key];
      }
    });

    const hackathon = await this.hackathonRepository.create(createPayload);

    await this.invalidatePublicCaches(hackathon._id.toString());

    return hackathon;
  }

  async getMyHackathons(adminId) {
    return this.hackathonRepository.findByCreator(adminId);
  }

  async updateHackathon({ hackathonId, adminId, payload }) {
    const hackathon = await this.hackathonRepository.findById(hackathonId);

    if (!hackathon) {
      throw new NotFoundError("Event not found");
    }

    const isOwner = hackathon.createdBy.toString() === adminId.toString();

    if (!isOwner) {
      const admin = await this.adminRepository.getById(adminId);

      if (!admin?.controller) {
        throw new ForbiddenError("Not your event");
      }
    }

    if (hackathon.lifecycleStatus === "COMPLETED") {
      throw new ForbiddenError("Completed events cannot be edited");
    }

    /**
     * Team validation
     */

    if (payload.participationType === "TEAM" && payload.maxTeamSize < 2) {
      throw new BadRequestError("Team event must have maxTeamSize >= 2");
    }

    /**
     * Phase validation
     */

    if (payload.phases && payload.phases.length === 0) {
      throw new BadRequestError("At least one phase is required");
    }

    /**
     * Event format is locked once matches exist — reformatting a
     * hackathon mid-tournament would orphan its Match documents.
     */

    if (
      payload.eventFormat &&
      payload.eventFormat !== hackathon.eventFormat &&
      (await this.matchRepository.existsForHackathon(hackathonId))
    ) {
      throw new BadRequestError(
        "Event format can't be changed once matches have been created"
      );
    }

    await this.deleteHackathonImage(hackathon, payload);

    await this.deleteRemovedGalleryImages(hackathon, payload);

    const updatePayload = {
      image: payload.image,
      title: payload.title,
      subTitle: payload.subTitle,
      venue: payload.venue,
      description: payload.description,
      detailsContent: payload.detailsContent,

      category: payload.category,
      techStacks: payload.techStacks,
      gallery: payload.gallery,
      difficulty: payload.difficulty,

      contacts: payload.contacts,
      resources: payload.resources,
      faqs: payload.faqs,

      prizes: payload.prizes,

      votingConfig: payload.votingConfig,
      judgingConfig: payload.judgingConfig,

      showResult: payload.showResult,
      publicLeaderboardLimit: payload.publicLeaderboardLimit,

      phases: payload.phases,
      registrationForm: payload.registrationForm,

      participationType: payload.participationType,
      maxTeamSize: payload.maxTeamSize,
      eventFormat: payload.eventFormat,

      tags: payload.tags,
    };

    Object.keys(updatePayload).forEach((key) => {
      if (updatePayload[key] === undefined) {
        delete updatePayload[key];
      }
    });

    const updated = await this.hackathonRepository.update(
      hackathonId,
      updatePayload
    );

    await this.invalidatePublicCaches(hackathonId, hackathon.slug);

    this.logger.info(
      {
        hackathonId,
        adminId,
      },
      "Event updated"
    );

    return updated;
  }

  async submitForApproval({ hackathonId, adminId }) {
    const hackathon = await this.hackathonRepository.findById(hackathonId);

    if (!hackathon) {
      throw new NotFoundError("Event not found");
    }

    if (hackathon.createdBy.toString() !== adminId.toString()) {
      throw new ForbiddenError("Not your event");
    }

    if (hackathon.status === "PENDING_APPROVAL") {
      throw new BadRequestError("Already submitted for approval");
    }

    if (hackathon.lifecycleStatus === "COMPLETED") {
      throw new ForbiddenError("Completed events cannot be edited");
    }

    if (hackathon.status === "APPROVED") {
      throw new BadRequestError("Event already approved");
    }

    /**
     * Required validations
     */

    if (!hackathon.title?.trim()) {
      throw new BadRequestError("Title is required");
    }

    if (!hackathon.description?.trim()) {
      throw new BadRequestError("Description is required");
    }

    if (!hackathon.image?.url || !hackathon.image?.key) {
      throw new BadRequestError("Event image is required");
    }

    if (!hackathon.phases || hackathon.phases.length === 0) {
      throw new BadRequestError("At least one phase is required");
    }

    if (
      !hackathon.registrationForm ||
      hackathon.registrationForm.length === 0
    ) {
      throw new BadRequestError("Registration form is required");
    }

    if (hackathon.participationType === "TEAM" && hackathon.maxTeamSize < 2) {
      throw new BadRequestError("Invalid team size");
    }

    const updated = await this.hackathonRepository.updateStatus(
      hackathonId,
      "PENDING_APPROVAL"
    );

    this.logger.info(
      {
        hackathonId,
        adminId,
      },
      "Event submitted for approval"
    );

    // Tell the platform controllers there's something waiting for them.
    const [owner, controllers] = await Promise.all([
      this.adminRepository.getById(adminId),
      this.adminRepository.getControllers(),
    ]);
    await Promise.all(
      controllers.map((c) =>
        this.notificationClient.createNotification({
          userId: c._id,
          title: "Event awaiting approval",
          message: `${owner?.adminName || "An organizer"} submitted "${hackathon.title}" for approval.`,
          type: "SYSTEM",
          actionUrl: "/admin",
        })
      )
    );

    return updated;
  }

  async getPendingHackathons(controllerId) {
    const controller = await this.adminRepository.getById(controllerId);

    if (!controller || !controller.controller) {
      throw new ForbiddenError("Unauthorized");
    }

    return this.hackathonRepository.getPendingHackathons();
  }

  async getAllHackathonsForController(controllerId) {
    const controller = await this.adminRepository.getById(controllerId);

    if (!controller || !controller.controller) {
      throw new ForbiddenError("Unauthorized");
    }

    return this.hackathonRepository.getAllHackathonsForController();
  }

  async approveHackathon({ hackathonId, controllerId }) {
    const controller = await this.adminRepository.getById(controllerId);

    if (!controller || !controller.controller) {
      throw new ForbiddenError("Unauthorized");
    }

    const hackathon = await this.hackathonRepository.findById(hackathonId);

    if (!hackathon) {
      throw new NotFoundError("Event not found");
    }

    if (hackathon.status !== "PENDING_APPROVAL") {
      throw new BadRequestError("Event is not pending approval");
    }

    const updated = await this.hackathonRepository.update(hackathonId, {
      status: "APPROVED",
      approvedBy: controllerId,
      approvedAt: new Date(),
      rejectionReason: "",
    });

    await this.invalidatePublicCaches(hackathonId, updated.slug);

    await this.notificationClient.createNotification({
      userId: hackathon.createdBy,
      title: "Event Approved",
      message: `${hackathon.title} has been approved and is now live.`,
      type: "HACKATHON",
      actionUrl: `/hackathon/${updated.slug}`,
      metadata: { hackathonId: hackathonId.toString() },
    });

    const creator = await this.adminRepository.getById(hackathon.createdBy);
    if (creator?.email) {
      await this.notificationClient.sendEmail({
        type: "hackathon-approved",
        user: { email: creator.email, name: creator.adminName },
        hackathon: {
          hackathonName: hackathon.title,
          hackathonLink: `${process.env.FRONTEND_URL}/hackathon/${updated.slug}`,
        },
      });
    }

    // Platform-wide "new hackathon" announcement — in-app + push only (push
    // has its own per-user opt-in and browser-level unsubscribe already;
    // broadcasting the same thing over email would need a mailing-list
    // unsubscribe mechanism this platform doesn't have, so that stays out).
    // Fire-and-forget: a slow/failed broadcast must never hold up the
    // approval response itself.
    const allUsers = await this.userRepository.getAllUserIds();
    mapWithConcurrency(allUsers, (u) =>
      this.notificationClient.createNotification({
        userId: u._id,
        title: "New Event Just Dropped",
        message: `${hackathon.title} is now live on HackSprint — check it out.`,
        type: "HACKATHON",
        actionUrl: `/hackathon/${updated.slug}`,
        metadata: { hackathonId: hackathonId.toString() },
      })
    ).catch((error) => {
      this.logger.error(
        { err: error, hackathonId: hackathonId.toString() },
        "Failed to broadcast new-hackathon announcement"
      );
    });

    return updated;
  }

  async rejectHackathon({ hackathonId, controllerId, reason }) {
    const controller = await this.adminRepository.getById(controllerId);

    if (!controller || !controller.controller) {
      throw new ForbiddenError("Unauthorized");
    }

    const hackathon = await this.hackathonRepository.findById(hackathonId);

    if (!hackathon) {
      throw new NotFoundError("Event not found");
    }

    if (hackathon.status !== "PENDING_APPROVAL") {
      throw new BadRequestError("Event is not pending approval");
    }

    const rejected = await this.hackathonRepository.update(hackathonId, {
      status: "REJECTED",
      rejectionReason: reason || "",
    });

    await this.invalidatePublicCaches(hackathonId);

    await this.notificationClient.createNotification({
      userId: hackathon.createdBy,
      title: "Event Rejected",
      message: reason
        ? `${hackathon.title} was rejected: ${reason}`
        : `${hackathon.title} was rejected by a platform controller.`,
      type: "HACKATHON",
      actionUrl: `/admin`,
      metadata: { hackathonId: hackathonId.toString() },
    });

    const creator = await this.adminRepository.getById(hackathon.createdBy);
    if (creator?.email) {
      await this.notificationClient.sendEmail({
        type: "hackathon-rejected",
        user: { email: creator.email, name: creator.adminName },
        hackathon: {
          hackathonName: hackathon.title,
          reason: reason || "No reason was provided.",
        },
      });
    }

    return rejected;
  }

  async getHackathonAdminOverview({ hackathonId, adminId }) {
    if (!mongoose.Types.ObjectId.isValid(hackathonId)) {
      throw new BadRequestError("Invalid event id");
    }

    const hackathon = await this.hackathonRepository.getById(hackathonId);

    if (!hackathon) {
      throw new NotFoundError("Event not found");
    }

    const isOwner = hackathon.createdBy._id.toString() === adminId.toString();

    const admin = await this.adminRepository.getById(adminId);

    // Checked unconditionally (not just for non-owners) so an owner who has
    // also assigned themselves as a judge can still score submissions —
    // otherwise being "owner" would silently override an explicit judge
    // assignment on their own hackathon.
    const isAssignedJudge = !!(await this.judgeAssignmentRepository.exists(
      hackathonId,
      adminId
    ));

    if (!isOwner && !admin?.controller && !isAssignedJudge) {
      throw new ForbiddenError("Unauthorized");
    }

    const viewerRole = isOwner
      ? "owner"
      : admin?.controller
      ? "controller"
      : "judge";

    const canScore = isAssignedJudge;

    const [registrations, teams, submissions] = await Promise.all([
      this.registrationRepository.getParticipants(hackathonId),
      this.teamRepository.getTeamsByHackathon(hackathonId),
      this.submissionRepository.getHackathonSubmissions(hackathonId),
    ]);

    const submittedParticipantIds = new Set(
      submissions
        .filter((s) => s.participant)
        .map((s) => s.participant._id.toString())
    );

    const submittedTeamIds = new Set(
      submissions.filter((s) => s.team).map((s) => s.team._id.toString())
    );

    // For a judge: which submissions they've already scored, so the list can
    // say "reviewed" instead of making them open each one to find out.
    const myScoreBySubmission = new Map();
    if (canScore && submissions.length > 0) {
      const mine = await this.submissionReviewRepository.getMyScoresForSubmissions(
        adminId,
        submissions.map((s) => s._id)
      );
      mine.forEach((r) => myScoreBySubmission.set(r.submission.toString(), r.score));
    }
    const progressFor = (pred) => {
      const subs = submissions.filter(pred);
      const done = subs.filter((s) => myScoreBySubmission.has(s._id.toString()));
      return { total: subs.length, reviewed: done.length };
    };

    const teamsWithStatus = teams.map((team) => ({
      ...team,
      hasSubmitted: submittedTeamIds.has(team._id.toString()),
      ...(canScore && {
        myReview: progressFor((s) => s.team && s.team._id.toString() === team._id.toString()),
      }),
    }));

    const individualParticipants = registrations
      .filter((r) => !r.team)
      .map((r) => ({
        ...r,
        hasSubmitted: submittedParticipantIds.has(r.user._id.toString()),
        ...(canScore && {
          myReview: progressFor((s) => s.participant && s.participant._id.toString() === r.user._id.toString()),
        }),
      }));

    return {
      hackathon,
      teams: teamsWithStatus,
      individualParticipants,
      totalRegistrations: registrations.length,
      totalTeams: teams.length,
      totalSubmissions: submissions.length,
      viewerRole,
      canScore,
    };
  }

  async getEntitySubmissions({ hackathonId, adminId, entityType, entityId }) {
    if (
      !mongoose.Types.ObjectId.isValid(hackathonId) ||
      !mongoose.Types.ObjectId.isValid(entityId)
    ) {
      throw new BadRequestError("Invalid id");
    }

    if (!["team", "participant"].includes(entityType)) {
      throw new BadRequestError("Invalid entity type");
    }

    const hackathon = await this.hackathonRepository.getById(hackathonId);

    if (!hackathon) {
      throw new NotFoundError("Event not found");
    }

    const isOwner = hackathon.createdBy._id.toString() === adminId.toString();
    const admin = await this.adminRepository.getById(adminId);

    // Checked unconditionally (not just for non-owners) so an owner who has
    // also assigned themselves as a judge can still score submissions —
    // otherwise being "owner" would silently override an explicit judge
    // assignment on their own hackathon.
    const isAssignedJudge = !!(await this.judgeAssignmentRepository.exists(
      hackathonId,
      adminId
    ));

    if (!isOwner && !admin?.controller && !isAssignedJudge) {
      throw new ForbiddenError("Unauthorized");
    }

    const viewerRole = isOwner
      ? "owner"
      : admin?.controller
      ? "controller"
      : "judge";

    const canScore = isAssignedJudge;

    let entity;

    if (entityType === "team") {
      const team = await this.teamRepository.getTeamDetails(entityId);

      if (!team) {
        throw new NotFoundError("Team not found");
      }

      entity = { type: "team", name: team.name, leader: team.leader, members: team.members };
    } else {
      const participant = await this.registrationRepository.getParticipantByUser(
        hackathonId,
        entityId
      );

      if (!participant) {
        throw new NotFoundError("Participant not found");
      }

      entity = {
        type: "participant",
        name: participant.user?.name,
        email: participant.user?.email,
      };
    }

    const submissions = await this.submissionRepository.getSubmissionsForEntity(
      hackathonId,
      entityType === "team" ? { teamId: entityId } : { participantId: entityId }
    );

    const allReviews = submissions.length
      ? await this.submissionReviewRepository.getReviewsForSubmissions(
          submissions.map((s) => s._id)
        )
      : [];

    const reviewsBySubmission = new Map();
    for (const review of allReviews) {
      const key = review.submission.toString();
      if (!reviewsBySubmission.has(key)) reviewsBySubmission.set(key, []);
      reviewsBySubmission.get(key).push({
        _id: review._id,
        judge: review.judge
          ? {
              _id: review.judge._id,
              adminName: review.judge.adminName,
              email: review.judge.email,
            }
          : null,
        score: review.score,
        feedback: review.feedback,
        createdAt: review.createdAt,
      });
    }

    const serializeSubmission = (submission) => ({
      _id: submission._id,
      title: submission.title,
      description: submission.description,
      submissionData: submission.submissionData,
      status: submission.status,
      resultStatus: submission.resultStatus,
      hackathonPoints: submission.hackathonPoints,
      averageScore: submission.averageScore,
      reviewCount: submission.reviewCount,
      submittedAt: submission.submittedAt,
      qualificationStatus: submission.qualificationStatus,
      reviews: reviewsBySubmission.get(submission._id.toString()) || [],
    });

    const submissionPhases = (hackathon.phases || []).filter(
      (phase) => phase?._id && phase.phaseType === "SUBMISSION"
    );

    const phaseById = new Map(submissionPhases.map((p) => [p._id.toString(), p]));

    const submissionsByPhase = new Map();
    const orphanedSubmissions = [];

    for (const submission of submissions) {
      const key = submission.phaseId ? submission.phaseId.toString() : null;

      if (key && phaseById.has(key)) {
        submissionsByPhase.set(key, submission);
      } else {
        orphanedSubmissions.push(submission);
      }
    }

    // Best-effort field-definition lookup for orphaned submissions, whose
    // originating phase no longer exists (edited/removed) or was never set.
    const fieldDefsByName = new Map();
    for (const phase of submissionPhases) {
      for (const field of phase.submissionForm || []) {
        if (!fieldDefsByName.has(field.fieldName)) {
          fieldDefsByName.set(field.fieldName, field);
        }
      }
    }

    const phases = submissionPhases.map((phase) => {
      const submission = submissionsByPhase.get(phase._id.toString()) || null;

      return {
        phaseId: phase._id,
        phaseName: phase.phaseName,
        startDate: phase.startDate,
        endDate: phase.endDate,
        submissionForm: phase.submissionForm || [],
        weight: phase.weight,
        qualificationRule: phase.qualificationRule,
        judgingConfig: phase.judgingConfig,
        concludedAt: phase.concludedAt,
        submission: submission ? serializeSubmission(submission) : null,
      };
    });

    const inferOrphanField = (fieldName, value) => {
      const looksLikeUrl = (v) => typeof v === "string" && /^https?:\/\//i.test(v);
      const looksLikeImage = (v) =>
        typeof v === "string" && /\.(png|jpe?g|gif|webp|svg)(\?|$)/i.test(v);

      if (Array.isArray(value)) {
        const urls = value.map((v) => (typeof v === "string" ? v : v?.url)).filter(Boolean);

        if (urls.length === 0) return null;

        return {
          fieldName,
          label: fieldName,
          fieldType: urls.some(looksLikeImage) ? "MULTI_IMAGE" : "MULTI_DOCUMENT",
        };
      }

      if (typeof value === "object") {
        // A plain object with no url (e.g. cached repo stats) isn't something
        // the user submitted — it's derived metadata, so skip it.
        if (!value.url) return null;

        return {
          fieldName,
          label: fieldName,
          fieldType: looksLikeImage(value.url) ? "IMAGE" : "DOCUMENT",
        };
      }

      return {
        fieldName,
        label: fieldName,
        fieldType: looksLikeUrl(value) ? "URL" : "TEXT",
      };
    };

    const orphaned = orphanedSubmissions.map((submission) => {
      const submissionForm = Object.entries(submission.submissionData || {})
        .map(([fieldName, value]) => {
          const isEmpty =
            value === null ||
            value === undefined ||
            value === "" ||
            (Array.isArray(value) && value.length === 0);

          if (isEmpty) return null;

          return fieldDefsByName.get(fieldName) || inferOrphanField(fieldName, value);
        })
        .filter(Boolean);

      return {
        phaseId: null,
        phaseName: "Additional Submission",
        submissionForm,
        submission: serializeSubmission(submission),
      };
    });

    return {
      hackathon: {
        _id: hackathon._id,
        title: hackathon.title,
        slug: hackathon.slug,
        judgingConfig: hackathon.judgingConfig,
      },
      entity,
      viewerRole,
      canScore,
      phases: [...phases, ...orphaned],
    };
  }

  // Powers the admin submissions list's phase-filter tabs — everyone who
  // submitted to one specific round, instead of drilling into one team at
  // a time via getEntitySubmissions.
  async getPhaseSubmissions({ hackathonId, phaseId, adminId }) {
    if (
      !mongoose.Types.ObjectId.isValid(hackathonId) ||
      !mongoose.Types.ObjectId.isValid(phaseId)
    ) {
      throw new BadRequestError("Invalid id");
    }

    const hackathon = await this.hackathonRepository.getById(hackathonId);

    if (!hackathon) {
      throw new NotFoundError("Event not found");
    }

    const isOwner = hackathon.createdBy._id.toString() === adminId.toString();
    const admin = await this.adminRepository.getById(adminId);
    const isAssignedJudge = !!(await this.judgeAssignmentRepository.exists(
      hackathonId,
      adminId
    ));

    if (!isOwner && !admin?.controller && !isAssignedJudge) {
      throw new ForbiddenError("Unauthorized");
    }

    const phase = (hackathon.phases || []).find(
      (p) => p._id.toString() === phaseId.toString()
    );

    if (!phase || phase.phaseType !== "SUBMISSION") {
      throw new BadRequestError("Invalid submission phase");
    }

    const submissions = await this.submissionRepository.getSubmissionsByPhase(
      hackathonId,
      phaseId
    );

    let myScores = new Map();
    if (isAssignedJudge && submissions.length > 0) {
      const mine = await this.submissionReviewRepository.getMyScoresForSubmissions(
        adminId,
        submissions.map((s) => s._id)
      );
      myScores = new Map(mine.map((r) => [r.submission.toString(), r.score]));
    }

    return {
      phase: {
        _id: phase._id,
        phaseName: phase.phaseName,
        startDate: phase.startDate,
        endDate: phase.endDate,
        weight: phase.weight,
        qualificationRule: phase.qualificationRule,
        judgingConfig: phase.judgingConfig,
        concludedAt: phase.concludedAt,
      },
      canScore: isAssignedJudge,
      viewerRole: isOwner ? "owner" : admin?.controller ? "controller" : "judge",
      submissions: isAssignedJudge
        ? submissions.map((sub) => ({
            ...(sub.toObject ? sub.toObject() : sub),
            myReview: myScores.has(sub._id.toString())
              ? { reviewed: true, score: myScores.get(sub._id.toString()) }
              : { reviewed: false },
          }))
        : submissions,
    };
  }

  // Admin-facing scoreboard — mirrors submissionService.getHackathonResults'
  // finalScore ranking (judge average + weighted votes) so the numbers match
  // what gets published, but isn't gated behind lifecycleStatus/showResult
  // (an organizer/judge needs to see standings to decide when to publish,
  // not just after publishing) and returns everyone instead of slicing to
  // publicLeaderboardLimit.
  async getAdminResults({ hackathonId, adminId }) {
    if (!mongoose.Types.ObjectId.isValid(hackathonId)) {
      throw new BadRequestError("Invalid event id");
    }

    const hackathon = await this.hackathonRepository.getById(hackathonId);

    if (!hackathon) {
      throw new NotFoundError("Event not found");
    }

    const isOwner = hackathon.createdBy._id.toString() === adminId.toString();
    const admin = await this.adminRepository.getById(adminId);
    const isAssignedJudge = !!(await this.judgeAssignmentRepository.exists(
      hackathonId,
      adminId
    ));

    if (!isOwner && !admin?.controller && !isAssignedJudge) {
      throw new ForbiddenError("Unauthorized");
    }

    const submissions = await this.submissionRepository.getHackathonSubmissions(
      hackathonId
    );

    return buildWeightedLeaderboard({ hackathon, submissions });
  }

  // The one action that actually makes judged scores/feedback visible to
  // participants and fires their "results are out" notification. Everything
  // else (judges scoring, the admin scoreboard above) happens without any
  // participant-facing signal — this is deliberately the single choke point,
  // so results can never leak piecemeal as individual judges finish scoring.
  async releaseResults({ hackathonId, adminId }) {
    if (!mongoose.Types.ObjectId.isValid(hackathonId)) {
      throw new BadRequestError("Invalid event id");
    }

    const hackathon = await this.hackathonRepository.getById(hackathonId);

    if (!hackathon) {
      throw new NotFoundError("Event not found");
    }

    const isOwner = hackathon.createdBy._id.toString() === adminId.toString();

    if (!isOwner) {
      const admin = await this.adminRepository.getById(adminId);

      if (!admin?.controller) {
        throw new ForbiddenError("Not your event");
      }
    }

    if (getLifecycleStatus(hackathon) !== "COMPLETED") {
      throw new ForbiddenError(
        "Results can only be released after the event has concluded"
      );
    }

    if (hackathon.showResult) {
      throw new BadRequestError("Results have already been released");
    }

    await this.hackathonRepository.update(hackathonId, { showResult: true });

    await this.invalidatePublicCaches(hackathonId, hackathon.slug);

    try {
      await this.cacheService.del(REDIS_KEYS.RESULTS(hackathonId));
    } catch (error) {
      this.logger.error({ error }, "Failed to invalidate results cache");
    }

    const allSubmissions = await this.submissionRepository.getHackathonSubmissions(
      hackathonId
    );
    const leaderboard = buildWeightedLeaderboard({
      hackathon,
      submissions: allSubmissions,
    });

    // Only entities at least one round actually scored — nothing to tell
    // someone whose submissions were never reviewed.
    const reviewed = leaderboard.filter((entity) =>
      entity.phaseScores.some((phase) => phase.averageScore > 0)
    );

    // The final round is the last SUBMISSION phase by start date — used to
    // scope the results EMAIL to finalists only, unlike the in-app
    // notification below which still reaches everyone reviewed.
    const submissionPhases = (hackathon.phases || [])
      .filter((p) => p.phaseType === "SUBMISSION")
      .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    const finalPhase = submissionPhases[submissionPhases.length - 1];

    let notifiedCount = 0;

    await Promise.all(
      reviewed.map(async (entity) => {
        const recipientIds = entity.team
          ? [entity.team.leader, ...(entity.team.members || [])].filter(Boolean)
          : entity.participant
          ? [entity.participant._id]
          : [];

        const scoreText =
          entity.finalScore != null
            ? ` Final score: ${Math.round(entity.finalScore)}.`
            : "";

        await Promise.all(
          recipientIds.map((userId) =>
            this.notificationClient.createNotification({
              userId,
              title: "Results Are Out!",
              message: `Your submission for ${hackathon.title} has been reviewed.${scoreText} View the full feedback on your dashboard.`,
              type: "RESULT",
              actionUrl: `/submissions/${entity._id}`,
              metadata: {
                hackathonId: hackathonId.toString(),
                submissionId: entity._id.toString(),
              },
            })
          )
        );

        const reachedFinal =
          finalPhase &&
          entity.phaseScores.some(
            (phase) => phase.phaseId.toString() === finalPhase._id.toString()
          );

        if (reachedFinal) {
          await mapWithConcurrency(recipientIds, async (userId) => {
            const recipient = await this.userRepository.getById(userId);
            if (!recipient?.email) return;

            await this.notificationClient.sendEmail({
              type: "results-announcement",
              user: { email: recipient.email, name: recipient.name },
              hackathon: {
                hackathonName: hackathon.title,
                hackathonLink: `${process.env.FRONTEND_URL}/hackathon/${hackathon.slug}`,
              },
            });
          });
        }

        notifiedCount += recipientIds.length;
      })
    );

    this.logger.info(
      { hackathonId, adminId, notifiedCount },
      "Results released"
    );

    return { released: true, notifiedCount };
  }

  // Applies a round's qualification rule (NONE/TOP_N/THRESHOLD) to every
  // submission in that phase. Safe to re-run: submissions an admin has
  // manually overridden are skipped, and notifications only fire for
  // entities whose status actually changed this run.
  async concludeRound({ hackathonId, phaseId, adminId }) {
    if (
      !mongoose.Types.ObjectId.isValid(hackathonId) ||
      !mongoose.Types.ObjectId.isValid(phaseId)
    ) {
      throw new BadRequestError("Invalid id");
    }

    const hackathon = await this.hackathonRepository.getById(hackathonId);

    if (!hackathon) {
      throw new NotFoundError("Event not found");
    }

    const ownerId = hackathon.createdBy._id
      ? hackathon.createdBy._id.toString()
      : hackathon.createdBy.toString();
    const isOwner = ownerId === adminId.toString();

    if (!isOwner) {
      const admin = await this.adminRepository.getById(adminId);

      if (!admin?.controller) {
        throw new ForbiddenError("Unauthorized");
      }
    }

    const phase = (hackathon.phases || []).find(
      (p) => p._id.toString() === phaseId.toString()
    );

    if (!phase || phase.phaseType !== "SUBMISSION") {
      throw new BadRequestError("Invalid submission phase");
    }

    const submissions = await this.submissionRepository.getSubmissionsByPhase(
      hackathonId,
      phaseId
    );

    const unreviewedCount = submissions.filter(
      (submission) => !(submission.reviewCount > 0)
    ).length;

    const rule = phase.qualificationRule || { type: "NONE" };
    const eligible = submissions.filter(
      (submission) => !submission.qualificationOverride
    );

    const statusBySubmission = new Map();

    if (rule.type === "TOP_N" && rule.value > 0) {
      const sorted = [...eligible].sort((a, b) => {
        if ((b.averageScore || 0) !== (a.averageScore || 0)) {
          return (b.averageScore || 0) - (a.averageScore || 0);
        }

        return new Date(a.submittedAt) - new Date(b.submittedAt);
      });

      sorted.forEach((submission, index) => {
        statusBySubmission.set(
          submission._id.toString(),
          index < rule.value ? "QUALIFIED" : "ELIMINATED"
        );
      });
    } else if (rule.type === "THRESHOLD" && rule.value != null) {
      for (const submission of eligible) {
        statusBySubmission.set(
          submission._id.toString(),
          (submission.averageScore || 0) >= rule.value
            ? "QUALIFIED"
            : "ELIMINATED"
        );
      }
    } else {
      for (const submission of eligible) {
        statusBySubmission.set(submission._id.toString(), "QUALIFIED");
      }
    }

    const changed = eligible.filter(
      (submission) =>
        statusBySubmission.get(submission._id.toString()) !==
        submission.qualificationStatus
    );

    await this.submissionRepository.bulkSetQualificationStatus(
      changed.map((submission) => ({
        submissionId: submission._id,
        status: statusBySubmission.get(submission._id.toString()),
      }))
    );

    await this.hackathonRepository.markPhaseConcluded(
      hackathonId,
      phaseId,
      adminId
    );
    await this.invalidatePublicCaches(hackathonId, hackathon.slug);

    let notifiedCount = 0;

    await Promise.all(
      changed.map(async (submission) => {
        const status = statusBySubmission.get(submission._id.toString());
        const recipientIds = submission.team
          ? [submission.team.leader, ...(submission.team.members || [])].filter(
              Boolean
            )
          : submission.participant
          ? [submission.participant._id || submission.participant]
          : [];

        const isQualified = status === "QUALIFIED";

        await Promise.all(
          recipientIds.map((userId) =>
            this.notificationClient.createNotification({
              userId,
              title: isQualified
                ? "You've Advanced to the Next Round"
                : "Round Results: Not Advancing",
              message: isQualified
                ? `You've qualified from ${phase.phaseName} in ${hackathon.title}. Get ready for the next round!`
                : `Your ${phase.phaseName} results for ${hackathon.title} are in — you didn't advance this time. Check your dashboard for feedback.`,
              type: "RESULT",
              actionUrl: `/submissions/${submission._id}`,
              metadata: {
                hackathonId: hackathonId.toString(),
                submissionId: submission._id.toString(),
                phaseId: phaseId.toString(),
                kind: status,
              },
            })
          )
        );

        notifiedCount += recipientIds.length;
      })
    );

    // Report the real outcome for the whole round: submissions an organiser
    // set by hand are skipped by the automatic pass, but they still count
    // toward who qualified / didn't — otherwise a round whose only entry was
    // set manually would read "0 qualified".
    const finalStatuses = submissions.map((submission) =>
      submission.qualificationOverride
        ? submission.qualificationStatus
        : statusBySubmission.get(submission._id.toString())
    );
    const qualifiedCount = finalStatuses.filter((x) => x === "QUALIFIED").length;
    const eliminatedCount = finalStatuses.filter((x) => x === "ELIMINATED").length;
    const manualCount = submissions.length - eligible.length;

    this.logger.info(
      { hackathonId, phaseId, adminId, qualifiedCount, eliminatedCount },
      "Round concluded"
    );

    return {
      concluded: true,
      qualifiedCount,
      eliminatedCount,
      manualCount,
      unreviewedCount,
      notifiedCount,
    };
  }

  // Lets an admin manually correct one entity's qualification status after
  // (or instead of) an automatic Conclude Round pass. Marks the submission
  // as overridden so a later re-run of concludeRound never clobbers it.
  async overrideQualification({ hackathonId, submissionId, adminId, status }) {
    if (
      !mongoose.Types.ObjectId.isValid(hackathonId) ||
      !mongoose.Types.ObjectId.isValid(submissionId)
    ) {
      throw new BadRequestError("Invalid id");
    }

    if (!["QUALIFIED", "ELIMINATED"].includes(status)) {
      throw new BadRequestError("Invalid qualification status");
    }

    const hackathon = await this.hackathonRepository.getById(hackathonId);

    if (!hackathon) {
      throw new NotFoundError("Event not found");
    }

    const ownerId = hackathon.createdBy._id
      ? hackathon.createdBy._id.toString()
      : hackathon.createdBy.toString();
    const isOwner = ownerId === adminId.toString();

    if (!isOwner) {
      const admin = await this.adminRepository.getById(adminId);

      if (!admin?.controller) {
        throw new ForbiddenError("Unauthorized");
      }
    }

    const submission = await this.submissionRepository.findById(submissionId);

    if (
      !submission ||
      submission.hackathon.toString() !== hackathonId.toString()
    ) {
      throw new NotFoundError("Submission not found");
    }

    const updated = await this.submissionRepository.update(submissionId, {
      qualificationStatus: status,
      qualificationOverride: true,
    });

    const phase = (hackathon.phases || []).find(
      (p) => p._id.toString() === submission.phaseId.toString()
    );

    const team = submission.team
      ? await this.teamRepository.getTeamDetails(submission.team)
      : null;

    const recipientIds = team
      ? [team.leader, ...(team.members || [])].filter(Boolean)
      : submission.participant
      ? [submission.participant]
      : [];

    const isQualified = status === "QUALIFIED";

    await Promise.all(
      recipientIds.map((userId) =>
        this.notificationClient.createNotification({
          userId,
          title: isQualified
            ? "You've Advanced to the Next Round"
            : "Round Results: Not Advancing",
          message: isQualified
            ? `You've qualified from ${phase?.phaseName || "a round"} in ${
                hackathon.title
              }. Get ready for the next round!`
            : `Your ${phase?.phaseName || "round"} results for ${
                hackathon.title
              } have been updated — you didn't advance this time.`,
          type: "RESULT",
          actionUrl: `/submissions/${submission._id}`,
          metadata: {
            hackathonId: hackathonId.toString(),
            submissionId: submission._id.toString(),
            phaseId: submission.phaseId.toString(),
            kind: `OVERRIDE_${status}`,
          },
        })
      )
    );

    return updated;
  }

  async deleteHackathon({ hackathonId, adminId }) {
    const hackathon = await this.hackathonRepository.findById(hackathonId);

    if (!hackathon) {
      throw new NotFoundError("Event not found");
    }

    const admin = await this.adminRepository.getById(adminId);

    const isController = admin?.controller;

    const ownerId = hackathon.createdBy._id
      ? hackathon.createdBy._id.toString()
      : hackathon.createdBy.toString();

    const isOwner = ownerId === adminId.toString();
    const slug = hackathon.slug;

    if (!isOwner && !isController) {
      throw new ForbiddenError("Unauthorized");
    }

    if (!isController) {
      const allowedStatuses = ["DRAFT", "REJECTED"];

      if (!allowedStatuses.includes(hackathon.status)) {
        throw new ForbiddenError(
          "Only draft or rejected events can be deleted"
        );
      }
    }

    if (hackathon.image?.key) {
      try {
        await this.mediaServiceClient.deleteFile(hackathon.image.key);
      } catch (error) {
        this.logger.error(
          {
            err: error,
            hackathonId,
          },
          "Failed to delete event image"
        );
      }
    }

    for (const image of hackathon.gallery || []) {
      if (!image?.key) {
        continue;
      }

      try {
        await this.mediaServiceClient.deleteFile(image.key);
      } catch (error) {
        this.logger.error(
          {
            err: error,
            hackathonId,
            key: image.key,
          },
          "Failed to delete gallery image"
        );
      }
    }

    await this.hackathonRepository.delete(hackathonId);

    await this.invalidatePublicCaches(hackathonId, slug);

    this.logger.info(
      {
        hackathonId,
        adminId,
      },
      "Event deleted"
    );

    return {
      success: true,
      message: "Event deleted successfully",
    };
  }

  getLifecycleStatus(hackathon) {
    if (hackathon.status !== "APPROVED") {
      return hackathon.status;
    }

    const now = new Date();

    if (!hackathon.phases || hackathon.phases.length === 0) {
      return "UPCOMING";
    }

    const activePhases = hackathon.phases.filter(
      (phase) => phase.isActive !== false
    );

    if (activePhases.length === 0) {
      return "UPCOMING";
    }

    const earliest = new Date(
      Math.min(
        ...activePhases.map((phase) => new Date(phase.startDate).getTime())
      )
    );

    const latest = new Date(
      Math.max(
        ...activePhases.map((phase) => new Date(phase.endDate).getTime())
      )
    );

    if (now < earliest) {
      return "UPCOMING";
    }

    if (now <= latest) {
      return "ACTIVE";
    }

    return "COMPLETED";
  }

  async getPublicHackathons(query) {
    const cacheKey = REDIS_KEYS.PUBLIC_HACKATHONS;

    const cached = await this.cacheService.get(cacheKey);

    let hackathons;

    if (cached) {
      hackathons = cached;
    } else {
      hackathons = await this.hackathonRepository.getApprovedHackathons();
      await this.cacheService.set(cacheKey, hackathons, 300);
    }

    hackathons = hackathons.map((hackathon) => ({
      ...(hackathon.toObject ? hackathon.toObject() : hackathon),
      lifecycleStatus: this.getLifecycleStatus(hackathon),
    }));

    const {
      status,
      category,
      difficulty,
      tag,
      search,
      page = 1,
      limit = 12,
    } = query;

    if (status) {
      hackathons = hackathons.filter((h) => h.lifecycleStatus === status);
    }

    if (category) {
      hackathons = hackathons.filter((h) =>
        h.category?.some((c) => c.toLowerCase() === category.toLowerCase())
      );
    }

    if (difficulty) {
      hackathons = hackathons.filter((h) => h.difficulty === difficulty);
    }

    if (tag) {
      hackathons = hackathons.filter((h) =>
        h.tags?.some((t) => t.toLowerCase() === tag.toLowerCase())
      );
    }

    if (typeof search === "string" && search.trim()) {
      const term = search.toLowerCase();

      hackathons = hackathons.filter(
        (h) =>
          h.title?.toLowerCase().includes(term) ||
          h.description?.toLowerCase().includes(term)
      );
    }

    const total = hackathons.length;
    // Clamped so a bad or huge value can't produce NaN or an unbounded page.
    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 12, 1), 50);
    const skip = (pageNum - 1) * limitNum;
    hackathons.sort(
      (a, b) =>
        Number(b.featured) - Number(a.featured) ||
        Number(a.featuredOrder || 0) - Number(b.featuredOrder || 0)
    );

    const data = hackathons.slice(skip, skip + limitNum);

    return {
      data,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
        hasNext: skip + data.length < total,
      },
    };
  }

  async getHackathonBySlug(slug) {
    const cacheKey = REDIS_KEYS.HACKATHON_SLUG(slug);

    const cached = await this.cacheService.get(cacheKey);

    if (cached) {
      return cached;
    }

    const hackathon = await this.hackathonRepository.findBySlug(slug);

    if (!hackathon) {
      throw new NotFoundError("Event not found");
    }

    await this.cacheService.set(cacheKey, hackathon, 300);

    return hackathon;
  }
}
