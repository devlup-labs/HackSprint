import VoteModel from "../models/vote.model.js";
import SubmissionModel from "../models/submission.js";
import UserModel from "../models/user.models.js";
import hackathonModel from "../models/hackathon.models.js";

// Toggle vote (add or remove)
export const toggleVote = async (req, res) => {
  try {
    const { submissionId, hackathonId } = req.body;
    const userId = req.user._id; // This will come from the userAuth middleware

    if (!submissionId || !hackathonId) {
      return res.status(400).json({
        message: "Submission ID and Hackathon ID are required",
        success: false,
      });
    }

    const hackathon = await hackathonModel.findById(hackathonId);

    if (!hackathon) {
      return res.status(404).json({
        message: "Hackathon not found",
        success: false,
      });
    }

    if (hackathon.votingDate) {
      const now = new Date();
      const votingEnd = new Date(hackathon.votingDate);

      if (now > votingEnd) {
        return res.status(403).json({
          message: "Voting period has ended",
          success: false,
        });
      }
    }

    // Check if submission exists
    const submission = await SubmissionModel.findById(submissionId);
    if (!submission) {
      return res.status(404).json({
        message: "Submission not found",
        success: false,
      });
    }

    // Check if vote already exists
    const existingVote = await VoteModel.findOne({
      submission: submissionId,
      user: userId,
    });

    if (existingVote) {
      // Remove vote
      await VoteModel.findByIdAndDelete(existingVote._id);
      return res.status(200).json({
        message: "Vote removed",
        success: true,
        voted: false,
      });
    } else {
      // Add vote
      const newVote = await VoteModel.create({
        submission: submissionId,
        user: userId,
        hackathon: hackathonId,
      });

      return res.status(201).json({
        message: "Vote added",
        success: true,
        voted: true,
        vote: newVote,
      });
    }
  } catch (error) {
    console.error("Toggle vote error:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
      error: error.message,
    });
  }
};

// Get votes for a specific hackathon (with submission details and vote counts)
export const getHackathonVotes = async (req, res) => {
  try {
    const { hackathonId } = req.params;

    if (!hackathonId) {
      return res.status(400).json({
        message: "Hackathon ID is required",
        success: false,
      });
    }

    // Get all submissions for this hackathon with their vote counts
    const submissions = await SubmissionModel.find({ hackathon: hackathonId })
      .populate("team", "name")
      .populate("participant", "name email")
      .lean();

    // Get vote counts for each submission
    const submissionsWithVotes = await Promise.all(
      submissions.map(async (submission) => {
        const voteCount = await VoteModel.countDocuments({
          submission: submission._id,
        });

        return {
          ...submission,
          voteCount,
        };
      })
    );

    // Sort by vote count (descending)
    submissionsWithVotes.sort((a, b) => b.voteCount - a.voteCount);

    return res.status(200).json({
      success: true,
      submissions: submissionsWithVotes,
    });
  } catch (error) {
    console.error("Get hackathon votes error:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
      error: error.message,
    });
  }
};

// Get user's votes for a specific hackathon
export const getUserVotes = async (req, res) => {
  try {
    const { hackathonId } = req.params;
    const userId = req.user._id; // From userAuth middleware

    if (!hackathonId) {
      return res.status(400).json({
        message: "Hackathon ID is required",
        success: false,
      });
    }

    const userVotes = await VoteModel.find({
      user: userId,
      hackathon: hackathonId,
    }).select("submission");

    const votedSubmissionIds = userVotes.map((vote) => vote.submission.toString());

    return res.status(200).json({
      success: true,
      votedSubmissions: votedSubmissionIds,
    });
  } catch (error) {
    console.error("Get user votes error:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
      error: error.message,
    });
  }
};

// Get vote count for a specific submission
export const getSubmissionVoteCount = async (req, res) => {
  try {
    const { submissionId } = req.params;

    if (!submissionId) {
      return res.status(400).json({
        message: "Submission ID is required",
        success: false,
      });
    }

    const voteCount = await VoteModel.countDocuments({
      submission: submissionId,
    });

    return res.status(200).json({
      success: true,
      voteCount,
    });
  } catch (error) {
    console.error("Get submission vote count error:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
      error: error.message,
    });
  }
};
