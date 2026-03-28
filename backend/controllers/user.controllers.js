import UserModel from "../models/user.models.js"
import devquestModel from "../models/devquest.model.js"
import dailyQuizModel from "../models/dailyQuiz.model.js"

export const saveGitHubLink = async (req, res) => {
  try {
    const { code, state } = req.body; // Expecting code from request body for PUT request

    if (!code) {
      return res.status(400).json({
        message: "Missing authorization code from GitHub OAuth"
      });
    }

    const userId = req.user._id;

    // Verify user is authenticated
    if (!userId) {
      return res.status(401).json({
        message: "User not authenticated"
      });
    }

    // Check if GitHub is already linked
    const existingUser = await UserModel.findById(req.user.id);
    if (existingUser?.isGitHubloggedIn && existingUser?.gitHubAccessToken) {
      return res.status(409).json({
        message: "GitHub account is already linked to this user"
      });
    }

    // Exchange code for access token
    const params = new URLSearchParams({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code: code
    });

    const tokenResponse = await axios.post(
      "https://github.com/login/oauth/access_token",
      params,
      {
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/x-www-form-urlencoded"
        },
        timeout: 10000 // 10 second timeout
      }
    );

    const { access_token, token_type, error, error_description } = tokenResponse.data;

    if (error) {
      console.error('GitHub OAuth error:', error_description);
      return res.status(400).json({
        message: "GitHub OAuth failed",
        error: error_description
      });
    }

    if (!access_token) {
      return res.status(400).json({
        message: "Failed to obtain GitHub access token"
      });
    }

    // Get GitHub user information
    const githubUserResponse = await axios.get("https://api.github.com/user", {
      headers: {
        Authorization: `${token_type || 'token'} ${access_token}`,
        "User-Agent": process.env.APP_NAME || "YourAppName"
      },
      timeout: 10000
    });

    const githubUser = githubUserResponse.data;

    // Check if this GitHub account is already linked to another user
    const existingGithubUser = await UserModel.findOne({
      gitHubUserId: githubUser.id,
      _id: { $ne: req.user.id } // Exclude current user
    });

    if (existingGithubUser) {
      return res.status(409).json({
        message: "This GitHub account is already linked to another user"
      });
    }

    // Save GitHub information to user account
    const updatedUser = await UserModel.findByIdAndUpdate(
      req.user.id,
      {
        gitHubAccessToken: access_token,
        isGitHubLoggedIn: true,
        // gitHubUserId: githubUser.id,
        // gitHubUsername: githubUser.login,
        // gitHubEmail: githubUser.email,
        // gitHubName: githubUser.name,
        // gitHubAvatarUrl: githubUser.avatar_url,
        // gitHubLinkedAt: new Date(),
        // updatedAt: new Date()
      },
      {
        new: true,
        select: '-gitHubAccessToken' // Don't return the token in response
      }
    );

    if (!updatedUser) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    // Return success response with GitHub user info
    return res.status(200).json({
      message: "GitHub account linked successfully",
      githubUser: {
        id: githubUser.id,
        login: githubUser.login,
        name: githubUser.name,
        email: githubUser.email,
        avatar_url: githubUser.avatar_url,
        bio: githubUser.bio,
        public_repos: githubUser.public_repos,
        followers: githubUser.followers,
        following: githubUser.following,
        created_at: githubUser.created_at
      },
      user: {
        id: updatedUser._id,
        isGitHubLoggedIn: updatedUser.isGitHubLoggedIn,
        gitHubUsername: updatedUser.gitHubUsername,
        gitHubLinkedAt: updatedUser.gitHubLinkedAt
      }
    });

  } catch (error) {
    console.error('Save GitHub link error:', error);

    // Handle specific axios errors
    if (error.response) {
      const status = error.response.status;

      if (status === 401) {
        return res.status(401).json({
          message: "Invalid GitHub authorization code"
        });
      } else if (status === 403) {
        return res.status(403).json({
          message: "GitHub API rate limit exceeded. Please try again later."
        });
      } else if (status === 422) {
        return res.status(400).json({
          message: "Invalid or expired GitHub authorization code"
        });
      }
    }

    // Handle network timeouts
    if (error.code === 'ECONNABORTED') {
      return res.status(408).json({
        message: "Request timeout. Please try again."
      });
    }

    return res.status(500).json({
      message: "Internal server error while linking GitHub account",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const updateGitHubLink = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await UserModel.findById(userId);

    if (!user || !user.gitHubAccessToken) {
      return res.status(400).json({
        message: "GitHub account not linked"
      });
    }

    // Refresh GitHub user information
    const githubUserResponse = await axios.get("https://api.github.com/user", {
      headers: {
        Authorization: `token ${user.gitHubAccessToken}`,
        "User-Agent": process.env.APP_NAME || "YourAppName"
      },
      timeout: 10000
    });

    const githubUser = githubUserResponse.data;

    // Update user's GitHub information
    const updatedUser = await UserModel.findByIdAndUpdate(
      req.user.id,
      {
        gitHubUsername: githubUser.login,
        gitHubEmail: githubUser.email,
        gitHubName: githubUser.name,
        gitHubAvatarUrl: githubUser.avatar_url,
        lastGitHubSync: new Date(),
        updatedAt: new Date()
      },
      {
        new: true,
        select: '-gitHubAccessToken'
      }
    );

    return res.status(200).json({
      message: "GitHub information updated successfully",
      githubUser: {
        id: githubUser.id,
        login: githubUser.login,
        name: githubUser.name,
        email: githubUser.email,
        avatar_url: githubUser.avatar_url,
        bio: githubUser.bio,
        public_repos: githubUser.public_repos,
        followers: githubUser.followers,
        following: githubUser.following
      },
      user: {
        id: updatedUser._id,
        gitHubUsername: updatedUser.gitHubUsername,
        lastGitHubSync: updatedUser.lastGitHubSync
      }
    });

  } catch (error) {
    console.error('Update GitHub link error:', error);

    if (error.response?.status === 401) {
      // Token is invalid, clear GitHub connection
      await UserModel.findByIdAndUpdate(
        req.user.id,
        {
          $unset: {
            gitHubAccessToken: 1,
            gitHubUserId: 1,
            gitHubUsername: 1,
            gitHubEmail: 1,
            gitHubName: 1,
            gitHubAvatarUrl: 1
          },
          isGitHubLoggedIn: false,
          updatedAt: new Date()
        }
      );

      return res.status(401).json({
        message: "GitHub token invalid. Please reconnect your GitHub account."
      });
    }

    return res.status(500).json({
      message: "Failed to update GitHub information"
    });
  }
};

export const removeGitHubLink = async (req, res) => {
  try {
    const updatedUser = await UserModel.findByIdAndUpdate(
      req.user._id,
      {
        $unset: {
          gitHubAccessToken: 1,
          // gitHubUserId: 1,
          // gitHubUsername: 1,
          // gitHubEmail: 1,
          // gitHubName: 1,
          // gitHubAvatarUrl: 1,
          // gitHubLinkedAt: 1,
          // lastGitHubSync: 1
        },
        isGitHubLoggedIn: false,
        // updatedAt: new Date()
      },
      {
        new: true,
        select: '-gitHubAccessToken'
      }
    );

    if (!updatedUser) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    return res.status(200).json({
      message: "GitHub account unlinked successfully",
      user: {
        id: updatedUser._id,
        isGitHubLoggedIn: updatedUser.isGitHubLoggedIn
      }
    });

  } catch (error) {
    console.error('Remove GitHub link error:', error);
    return res.status(500).json({
      message: "Failed to unlink GitHub account"
    });
  }
};

export const checkAndUpdateGitHubStatus = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.gitHubAccessToken) {
      user.isGitHubloggedIn = false;
      await user.save();
      return res.status(200).json({
        isGitHubloggedIn: false,
        message: "GitHub not connected. Please log in with GitHub to submit."
      });
    }

    // Verify token with GitHub API
    try {
      const ghRes = await axios.get("https://api.github.com/user", {
        headers: { Authorization: `token ${user.gitHubAccessToken}` },
      });

      if (ghRes.status === 200) {
        user.isGitHubloggedIn = true;
        await user.save();
        return res.status(200).json({
          isGitHubloggedIn: true,
          message: "GitHub connected, you can submit now",
          githubUser: ghRes.data
        });
      }
    } catch (err) {
      // Token invalid or expired
      user.isGitHubloggedIn = false;
      await user.save();
      return res.status(200).json({
        isGitHubloggedIn: false,
        message: "GitHub token invalid or expired. Please log in again."
      });
    }

  } catch (error) {
    console.error("Error checking GitHub login status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const increaseStreak = async (req, res) => {
  try {
    const { questionId } = req.body;
    const userId = req.user._id;

    if (!userId || !questionId) {
      return res.status(400).json({ message: "userId or questionId is required" });
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const question = await devquestModel.findById(questionId);
    if (!question) {
      return res.status(400).json({ message: "Question not found" });
    }
    user.points += question.points;
    user.currentQuizPoints += question.points;
    user.currentQuizTotalPoints += question.points;
    // user.streaks+=1; // Increment streak by 1
    user.devQuestionsCorrectlyAnswered += 1;
    await user.save();

    res.status(200).json({ message: "Streak and points are increased", streaks: user.streaks, points: user.points });
  } catch (error) {
    console.error("Error increasing streak or points:", error);
    res.status(500).json({ message: error.message });
  }
};

export const resetStreak = async (req, res) => {
  try {
    const { questionId } = req.body;
    const userId = req.user._id;

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const question = await devquestModel.findById(questionId);
    if (!question) {
      return res.status(400).json({ message: "Question not found" });
    }
    user.devQuestionsIncorrectlyAnswered += 1;
    user.currentQuizTotalPoints += question.points;
    // if(user.devQuestionsCorrectlyAnswered < user.devQuestionsIncorrectlyAnswered){
    //   user.streaks = 0;
    // }
    // if(user.devquestions) // Reset streak to 0
    await user.save();

    res.status(200).json({ message: "Streak reset", streaks: user.streaks });
  } catch (error) {
    console.error("Error resetting streak:", error);
    res.status(500).json({ message: error.message });
  }
};

export const devQuestionsAnsweredData = async (req, res) => {
  try {
    const { quizId } = req.body;
    const userId = req.user._id;
    if (!userId || !quizId) {
      return res.status(404).json({ message: "user or quiz id not found" });
    }
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const quiz = await dailyQuizModel.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: "dailyquiz not found" })
    }
    if (!quiz.attemptedBy.includes(userId)) {
      quiz.attemptedBy.push(userId);
      await quiz.save();
    }
    user.devQuestionSubmittedTime = new Date(Date.now());
    if (user.currentQuizPoints >= (user.currentQuizTotalPoints) / 2) {
      user.streaks += 1;
    } else {
      user.streaks = 0;
    }
    if (!user.attemptedDevQuestions.includes(quizId)) {
      user.attemptedDevQuestions.push(quizId);
    }
    console.log(user.devQuestionsCorrectlyAnswered);
    console.log(user.devQuestionsIncorrectlyAnswered);
    user.devQuestionsCorrectlyAnswered = 0;
    user.devQuestionsIncorrectlyAnswered = 0;
    user.currentQuizPoints = 0;
    user.currentQuizTotalPoints = 0;
    await user.save();
    res.status(200).json({
      message: "Streaks updated",
      streaks: user.streaks
    })
  } catch (error) {
    console.error("Error resetting streak:", error);
    res.status(500).json({ message: error.message });
  }
}

export const addEducation = async (req, res) => {
  try {
    const { institute, passOutYear, department, location } = req.body;
    const userId = req.user._id;

    if (!userId || !institute || !passOutYear || !department || !location) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { $push: { education: { institute, passOutYear, department, location } } },
      { new: true }
    );

    if (!updatedUser) return res.status(404).json({ message: "User not found" });

    res.status(200).json({
      message: "Education added successfully",
      education: updatedUser.education,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const editEducation = async (req, res) => {
  try {
    const { eduId, institute, passOutYear, department, location } = req.body;
    const userId = req.user._id;

    if (!userId || !eduId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const updatedUser = await UserModel.findOneAndUpdate(
      { _id: userId, "education._id": eduId },
      {
        $set: {
          "education.$.institute": institute,
          "education.$.passOutYear": passOutYear,
          "education.$.department": department,
          "education.$.location": location,
        }
      },
      { new: true }
    );

    if (!updatedUser) return res.status(404).json({ message: "User or Education not found" });

    res.status(200).json({
      message: "Education updated successfully",
      education: updatedUser.education,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const deleteEducation = async (req, res) => {
  try {
    const { eduId } = req.body;
    const userId = req.user._id;

    if (!userId || !eduId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { $pull: { education: { _id: eduId } } },
      { new: true }
    );

    if (!updatedUser) return res.status(404).json({ message: "User or Education not found" });

    res.status(200).json({
      message: "Education deleted successfully",
      education: updatedUser.education,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const addConnectedApp = async (req, res) => {
  try {
    const { appName, appURL } = req.body;
    const userId = req.user._id;

    if (!userId || !appName || !appURL) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { $push: { connectedApps: { appName, appURL } } },
      { new: true }
    );

    if (!updatedUser) return res.status(404).json({ message: "User not found" });

    res.status(200).json({
      message: "Connected app added successfully",
      connectedApps: updatedUser.connectedApps,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const editConnectedApp = async (req, res) => {
  try {
    const { appId, appName, appURL } = req.body;
    const userId = req.user._id;

    if (!userId || !appId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const updatedUser = await UserModel.findOneAndUpdate(
      { _id: userId, "connectedApps._id": appId },
      {
        $set: {
          "connectedApps.$.appName": appName,
          "connectedApps.$.appURL": appURL,
        }
      },
      { new: true }
    );

    if (!updatedUser) return res.status(404).json({ message: "User or App not found" });

    res.status(200).json({
      message: "Connected app updated successfully",
      connectedApps: updatedUser.connectedApps,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const deleteConnectedApp = async (req, res) => {
  try {
    const { appId } = req.body;
    const userId = req.user._id;

    if (!userId || !appId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { $pull: { connectedApps: { _id: appId } } },
      { new: true }
    );

    if (!updatedUser) return res.status(404).json({ message: "User or App not found" });

    res.status(200).json({
      message: "Connected app deleted successfully",
      connectedApps: updatedUser.connectedApps,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const displayLeaderBoard = async (req, res) => {
  try {
    // Find the latest quiz by date (descending order, pick first one)
    const latestQuiz = await dailyQuizModel
      .findOne()
      .sort({ createdAt: -1 }) // latest quiz
      .populate("attemptedBy", "name email points devQuestionSubmittedTime");

    if (!latestQuiz) {
      return res.status(404).json({ message: "No quizzes found" });
    }

    // Sort attempted users only
    const leaderboard = latestQuiz.attemptedBy.sort((a, b) => {
      // First sort by points descending, then by submission time ascending
      if (b.points !== a.points) {
        return b.points - a.points;
      }
      return new Date(a.devQuestionSubmittedTime) - new Date(b.devQuestionSubmittedTime);
    });

    if (leaderboard.length === 0) {
      return res.status(404).json({ message: "No users attempted the latest quiz" });
    }

    return res.status(200).json({
      message: "Latest Quiz Leaderboard fetched successfully",
      quizId: latestQuiz._id,
      quizTitle: latestQuiz.Title,
      leaderboard
    });

  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    res.status(500).json({ message: "Something went wrong while fetching leaderboard!" });
  }
};

export const addLanguage = async (req, res) => {
  try {
    const { language } = req.body;
    const userId = req.user._id;

    if (!userId || !language) {
      return res.status(400).json({ message: "User ID and language are required" });
    }

    const user = await UserModel.findById(userId);

    if (!user) return res.status(404).json({ message: "User not found" });

    const exists = user.languages.some(
      (langObj) => langObj.language.toLowerCase() === language.toLowerCase()
    );

    if (exists) {
      return res.status(400).json({ message: "Language already added" });
    }

    user.languages.push({ language });
    await user.save();

    res.status(200).json({ message: "Language added successfully", languages: user.languages });
  } catch (err) {
    console.error("Add language error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const removeLanguage = async (req, res) => {
  try {
    const { language } = req.body;
    const userId = req.user._id;

    if (!userId || !language) return res.status(400).json({ message: "User ID and language are required" });

    const user = await UserModel.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.languages = user.languages.filter(
      (langObj) => langObj.language.toLowerCase() !== language.toLowerCase()
    );

    await user.save();

    res.status(200).json({ message: "Language removed successfully", languages: user.languages });
  } catch (err) {
    console.error("Remove language error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const addSkill = async (req, res) => {
  try {
    const { skill } = req.body;
    const userId = req.user._id;

    if (!userId || !skill) {
      return res.status(400).json({ message: "User ID and skill are required" });
    }

    const user = await UserModel.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const exists = user.skills.some(
      (s) => s.skill.toLowerCase() === skill.toLowerCase()
    );

    if (exists) {
      return res.status(400).json({ message: "Skill already added" });
    }

    if (!user.skills) user.skills = [];
    user.skills.push({ skill });

    await user.save();

    res.status(200).json({ message: "Skill added successfully", skills: user.skills });
  } catch (err) {
    console.error("Add skill error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteSkill = async (req, res) => {
  try {
    const { skill } = req.body;
    const userId = req.user._id;

    if (!userId || !skill) {
      return res.status(400).json({ message: "User ID and skill are required" });
    }

    const user = await UserModel.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.skills = user.skills.filter(
      (s) => s.skill.toLowerCase() !== skill.toLowerCase()
    );

    await user.save();

    res.status(200).json({ message: "Skill removed successfully", skills: user.skills });
  } catch (err) {
    console.error("Remove skill error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

