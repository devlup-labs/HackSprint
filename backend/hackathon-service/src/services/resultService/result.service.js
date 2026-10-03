import { NotFoundError } from "../../errors/NotFoundError.js";
import { ForbiddenError } from "../../errors/ForbiddenError.js";

export class ResultService {
  constructor(submissionRepository, hackathonRepository) {
    this.submissionRepository = submissionRepository;
    this.hackathonRepository = hackathonRepository;
  }

  async getResults(hackathonId) {
    const hackathon = await this.hackathonRepository.getById(hackathonId);

    if (!hackathon) {
      throw new NotFoundError("Event not found");
    }

    if (!hackathon.showResult) {
      throw new ForbiddenError("Results are not published");
    }

    let leaderboard = await this.submissionRepository.getLeaderboard(
      hackathonId
    );

    if (hackathon.publicLeaderboardLimit) {
      leaderboard = leaderboard.slice(0, hackathon.publicLeaderboardLimit);
    }

    return leaderboard.map((submission, index) => ({
      rank: index + 1,
      submissionId: submission._id,
      title: submission.title,
      team: submission.team,
      participant: submission.participant,
      averageScore: submission.averageScore,
      reviewCount: submission.reviewCount,
      hackathonPoints: submission.hackathonPoints,
    }));
  }
}
