import SubmissionReviewModel from "../models/submissionReview.model.js";

export class SubmissionReviewRepository {
  async create(data, session = null) {
    const [review] = await SubmissionReviewModel.create([data], { session });

    return review;
  }

  async findByJudgeAndSubmission(judgeId, submissionId) {
    return SubmissionReviewModel.findOne({
      judge: judgeId,
      submission: submissionId,
    });
  }

  async updateReview(reviewId, updateData) {
    return SubmissionReviewModel.findByIdAndUpdate(reviewId, updateData, {
      new: true,
    });
  }

  // Deliberately selects only score + feedback — never touches `judge` at
  // all, so there's no field to accidentally leak once this is shown to the
  // participant who submitted. Judge identity must stay internal.
  async getPublicReviewsForSubmission(submissionId) {
    return SubmissionReviewModel.find({ submission: submissionId })
      .select("score feedback -_id")
      .lean();
  }

  // This judge's own reviews of the given submissions (score only).
  async getMyScoresForSubmissions(judgeId, submissionIds) {
    return SubmissionReviewModel.find({
      judge: judgeId,
      submission: { $in: submissionIds },
    })
      .select("submission score")
      .lean();
  }

  async getReviewsForSubmissions(submissionIds) {
    return SubmissionReviewModel.find({
      submission: { $in: submissionIds },
    })
      .populate("judge", "adminName email")
      .sort({ createdAt: -1 })
      .lean();
  }

  async getHackathonReviews(hackathonId) {
    return SubmissionReviewModel.find({
      hackathon: hackathonId,
    })
      .populate("judge", "adminName email")
      .populate("submission")
      .lean();
  }

  async getSubmissionAverage(submissionId) {
    const result = await SubmissionReviewModel.aggregate([
      {
        $match: {
          submission: submissionId,
        },
      },
      {
        $group: {
          _id: null,

          averageScore: {
            $avg: "$score",
          },

          reviewCount: {
            $sum: 1,
          },
        },
      },
    ]);

    return (
      result[0] || {
        averageScore: 0,
        reviewCount: 0,
      }
    );
  }

  async getJudgeReview(submissionId, judgeId) {
    return SubmissionReviewModel.findOne({
      submission: submissionId,
      judge: judgeId,
    });
  }

  async countReviews(submissionId) {
    return SubmissionReviewModel.countDocuments({
      submission: submissionId,
    });
  }

  async getJudgeReviews(hackathonId, judgeId) {
    return SubmissionReviewModel.find({
      hackathon: hackathonId,
      judge: judgeId,
    }).lean();
  }
}
