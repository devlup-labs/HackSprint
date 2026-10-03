import cron from "node-cron";
import { logger } from "../utils/logger.js";
import { MatchRepository } from "../repositories/match.repository.js";
import { NotificationClient } from "../clients/notification.client.js";
import { Sentry } from "../config/sentry.js";
import { runExclusive } from "../utils/clusterLock.js";

const matchRepository = new MatchRepository();
const notificationClient = new NotificationClient(logger);

// On-spot matches are same-day, in-person events — the 24h/12h cadence used
// for registration/submission deadlines is far too coarse here. These fire
// close enough to actually get a team to the arena on time.
const REMINDER_MILESTONES = [
  { minutes: 60, milestone: "1h", label: "in 1 hour" },
  { minutes: 15, milestone: "15m", label: "in 15 minutes — be ready!" },
];

const notifyTeam = async (team, hackathon, opponent, label, matchId) => {
  const recipients = [team.leader, ...(team.members || [])].filter(Boolean);

  await Promise.all(
    recipients.map((userId) =>
      notificationClient.createNotification({
        userId,
        title: "Match Starting Soon",
        message: `Your match against ${opponent.name} in ${hackathon.title} starts ${label}`,
        type: "TEAM",
        actionUrl: `/hackathon/${hackathon.slug}/bracket`,
        metadata: { hackathonId: hackathon._id.toString(), matchId: matchId.toString() },
      })
    )
  );
};

export const runMatchReminderSweep = async () => {
  for (const { minutes, milestone, label } of REMINDER_MILESTONES) {
    const matches = await matchRepository.findUpcomingForReminder(minutes, milestone);

    for (const match of matches) {
      try {
        await Promise.all([
          notifyTeam(match.teamA, match.hackathon, match.teamB, label, match._id),
          notifyTeam(match.teamB, match.hackathon, match.teamA, label, match._id),
        ]);

        await matchRepository.markReminderSent(match._id, milestone);

        logger.info(
          { matchId: match._id, hackathonId: match.hackathon._id, milestone },
          "Match reminder sent"
        );
      } catch (error) {
        logger.error(
          { err: error, matchId: match._id, milestone },
          "Failed to process match reminder"
        );
        Sentry.captureException(error);
      }
    }
  }
};

export const startMatchReminderJob = () => {
  // Every 5 minutes — the 15-minute window would mostly be missed on an
  // hourly cadence like the phase-reminder job uses.
  cron.schedule("*/5 * * * *", () => {
    runExclusive("match-reminders", 120, runMatchReminderSweep).catch((error) => {
      logger.error({ err: error }, "Match reminder sweep failed");
      Sentry.captureException(error);
    });
  });

  logger.info("Match reminder job scheduled (every 5 minutes)");
};
