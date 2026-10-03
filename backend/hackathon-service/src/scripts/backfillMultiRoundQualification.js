// One-time backfill for the multi-round qualification/cumulative-scoring
// feature. Run once at deploy, before traffic hits the new code paths:
//
//   node src/scripts/backfillMultiRoundQualification.js
//
// It exists to make the new schema fields' defaults safe for data that
// predates them:
//
// 1. Freezes every existing hackathon with more than one SUBMISSION phase
//    to today's exact "last phase only" ranking, by giving that last phase
//    weight=100 and every earlier one weight=0 — cumulative weighting only
//    kicks in for phases an admin configures after this runs.
// 2. Grandfathers every existing Submission in as QUALIFIED, so no
//    already-open next-round window suddenly starts blocking submissions
//    it previously allowed.
// 3. Preserves currently-visible scores (resultAvailable=true) for any
//    submission whose hackathon already had showResult=true, and also
//    retroactively flips on any submission that already satisfies the new
//    auto-reveal rule (every assigned judge has reviewed it).
//
// Safe to re-run: every step is idempotent (targets docs still at the
// pre-migration default, or recomputes the same true/false outcome).

import mongoose from "mongoose";
import dotenv from "dotenv";
import hackathonModel from "../models/hackathon.model.js";
import SubmissionModel from "../models/submission.models.js";
import JudgeAssignmentModel from "../models/judgeAssignment.model.js";

dotenv.config();

async function backfillPhaseWeights() {
  const hackathons = await hackathonModel.find({}).select("_id phases");

  let updatedHackathons = 0;

  for (const hackathon of hackathons) {
    const submissionPhases = hackathon.phases.filter(
      (phase) => phase.phaseType === "SUBMISSION"
    );

    if (submissionPhases.length < 2) continue;

    const lastPhaseId = submissionPhases[submissionPhases.length - 1]._id;
    let changed = false;

    for (const phase of hackathon.phases) {
      if (phase.phaseType !== "SUBMISSION") continue;
      if (phase.weight) continue; // already configured, leave it alone

      phase.weight = phase._id.equals(lastPhaseId) ? 100 : 0;
      changed = true;
    }

    if (changed) {
      await hackathon.save();
      updatedHackathons += 1;
    }
  }

  console.log(`[1/3] Froze phase weights on ${updatedHackathons} event(s).`);
}

async function backfillQualificationStatus() {
  const result = await SubmissionModel.updateMany(
    { qualificationStatus: "PENDING" },
    { $set: { qualificationStatus: "QUALIFIED" } }
  );

  console.log(
    `[2/3] Grandfathered ${result.modifiedCount} existing submission(s) as QUALIFIED.`
  );
}

async function backfillResultAvailable() {
  // (a) Preserve visibility for submissions whose hackathon already
  // released results the old way.
  const releasedHackathonIds = await hackathonModel
    .find({ showResult: true })
    .distinct("_id");

  const preserved = await SubmissionModel.updateMany(
    { hackathon: { $in: releasedHackathonIds }, resultAvailable: false },
    { $set: { resultAvailable: true } }
  );

  console.log(
    `[3/3a] Preserved visibility on ${preserved.modifiedCount} submission(s) from already-released events.`
  );

  // (b) Retroactively catch submissions that already satisfy the new
  // auto-reveal rule (every assigned judge has reviewed it) but were
  // gated behind the old hackathon-wide flag.
  const judgeCounts = await JudgeAssignmentModel.aggregate([
    { $group: { _id: "$hackathon", count: { $sum: 1 } } },
  ]);
  const judgeCountByHackathon = new Map(
    judgeCounts.map((row) => [row._id.toString(), row.count])
  );

  const stillGated = await SubmissionModel.find({
    resultAvailable: false,
    reviewCount: { $gt: 0 },
  }).select("_id hackathon reviewCount");

  const idsToFlip = stillGated
    .filter((submission) => {
      const judgeCount = judgeCountByHackathon.get(
        submission.hackathon.toString()
      );
      return judgeCount > 0 && submission.reviewCount >= judgeCount;
    })
    .map((submission) => submission._id);

  if (idsToFlip.length) {
    await SubmissionModel.updateMany(
      { _id: { $in: idsToFlip } },
      { $set: { resultAvailable: true } }
    );
  }

  console.log(
    `[3/3b] Retroactively revealed ${idsToFlip.length} submission(s) already fully judged under the new rule.`
  );
}

async function run() {
  await mongoose.connect(process.env.MONGO_URL);
  console.log("Connected to MongoDB. Starting backfill...");

  await backfillPhaseWeights();
  await backfillQualificationStatus();
  await backfillResultAvailable();

  console.log("Backfill complete.");
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((error) => {
  console.error("Backfill failed:", error);
  process.exit(1);
});
