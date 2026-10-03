import cron from "node-cron";
import { logger } from "../utils/logger.js";
import { HackathonRepository } from "../repositories/hackathon.repository.js";
import { UserRepository } from "../repositories/user.repository.js";
import { RegistrationRepository } from "../repositories/registration.repository.js";
import { TeamRepository } from "../repositories/team.repository.js";
import { SubmissionRepository } from "../repositories/submission.repository.js";
import { NotificationClient } from "../clients/notification.client.js";
import { mapWithConcurrency } from "../utils/concurrency.js";
import { Sentry } from "../config/sentry.js";
import { runExclusive } from "../utils/clusterLock.js";

const hackathonRepository = new HackathonRepository();
const userRepository = new UserRepository();
const registrationRepository = new RegistrationRepository();
const teamRepository = new TeamRepository();
const submissionRepository = new SubmissionRepository();
const notificationClient = new NotificationClient(logger);

// Standard two-stage reminder cadence — a heads-up a day out, then a final
// call as the window actually closes.
const REMINDER_MILESTONES = [
  { hours: 24, milestone: "24h", label: "in less than 24 hours" },
  { hours: 12, milestone: "12h", label: "in less than 12 hours — last call" },
];

const notifyRegistrationEndingSoon = async (hackathon, phase, label) => {
  const [wishlisters, participants] = await Promise.all([
    userRepository.getWishlistedUserIds(hackathon._id),
    registrationRepository.getParticipants(hackathon._id),
  ]);

  const registeredIds = new Set(
    participants.map((p) => p.user._id.toString())
  );

  const recipients = wishlisters.filter(
    (u) => !registeredIds.has(u._id.toString())
  );

  await mapWithConcurrency(recipients, (u) =>
    notificationClient.createNotification({
      userId: u._id,
      title: "Registration Closing Soon",
      message: `Registration for ${hackathon.title} closes ${label}. Don't miss out!`,
      type: "HACKATHON",
      actionUrl: `/hackathon/${hackathon.slug}`,
      metadata: { hackathonId: hackathon._id.toString(), phaseId: phase._id.toString() },
    })
  );

  return recipients.length;
};

const notifySubmissionEndingSoon = async (hackathon, phase, label) => {
  const submissions = await submissionRepository.getSubmissionsByPhase(
    hackathon._id,
    phase._id
  );

  let recipientIds = [];

  if (hackathon.participationType === "TEAM") {
    const teams = await teamRepository.getTeamsByHackathon(hackathon._id);

    const submittedTeamIds = new Set(
      submissions.filter((s) => s.team).map((s) => s.team._id.toString())
    );

    const pendingTeams = teams.filter(
      (t) => !submittedTeamIds.has(t._id.toString())
    );

    recipientIds = pendingTeams.flatMap((t) => [
      t.leader._id,
      ...t.members.map((m) => m._id),
    ]);
  } else {
    const participants = await registrationRepository.getParticipants(
      hackathon._id
    );

    const submittedParticipantIds = new Set(
      submissions
        .filter((s) => s.participant)
        .map((s) => s.participant._id.toString())
    );

    recipientIds = participants
      .filter((p) => !submittedParticipantIds.has(p.user._id.toString()))
      .map((p) => p.user._id);
  }

  await mapWithConcurrency(recipientIds, (userId) =>
    notificationClient.createNotification({
      userId,
      title: "Submission Deadline Approaching",
      message: `The submission window for ${hackathon.title} closes ${label}.`,
      type: "SUBMISSION",
      actionUrl: `/hackathon/${hackathon.slug}`,
      metadata: { hackathonId: hackathon._id.toString(), phaseId: phase._id.toString() },
    })
  );

  return recipientIds.length;
};

export const runPhaseReminderSweep = async () => {
  for (const { hours, milestone, label } of REMINDER_MILESTONES) {
    const hackathons = await hackathonRepository.getPhasesEndingSoon(
      hours,
      milestone
    );

    for (const hackathon of hackathons) {
      const phase = hackathon.phases?.[0];

      if (!phase) continue;

      try {
        const notified =
          phase.phaseType === "REGISTRATION"
            ? await notifyRegistrationEndingSoon(hackathon, phase, label)
            : await notifySubmissionEndingSoon(hackathon, phase, label);

        await hackathonRepository.markPhaseReminderSent(
          hackathon._id,
          phase._id,
          milestone
        );

        logger.info(
          {
            hackathonId: hackathon._id,
            phaseId: phase._id,
            phaseType: phase.phaseType,
            milestone,
            notified,
          },
          "Phase-ending reminder sent"
        );
      } catch (error) {
        logger.error(
          { err: error, hackathonId: hackathon._id, phaseId: phase._id, milestone },
          "Failed to process phase-ending reminder"
        );
        Sentry.captureException(error);
      }
    }
  }
};

export const startPhaseReminderJob = () => {
  cron.schedule("0 * * * *", () => {
    runExclusive("phase-reminders", 120, runPhaseReminderSweep).catch((error) => {
      logger.error({ err: error }, "Phase reminder sweep failed");
      Sentry.captureException(error);
    });
  });

  logger.info("Phase reminder job scheduled (hourly)");
};
