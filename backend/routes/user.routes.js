import express from "express";
import { Router } from "express";
import {
  checkAndUpdateGitHubStatus,
  saveGitHubLink,
  resetStreak,
  increaseStreak,
  devQuestionsAnsweredData,
  addConnectedApp,
  deleteConnectedApp,
  editConnectedApp,
  displayLeaderBoard,
  addEducation,
  editEducation,
  deleteEducation,
  addLanguage,
  removeLanguage,
  addSkill,
  deleteSkill,
} from "../controllers/user.controllers.js";
import { userAuth, verifyAuth } from "../middlewares/userAuth.js";
import rateLimit from "express-rate-limit";

const userRoutes = Router();

export const rateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 500,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: "Too many requests, please try again later.",
    });
  },
});

userRoutes.put("/save-gitHubLink", verifyAuth, rateLimiter, saveGitHubLink);
userRoutes.get(
  "/submission/github-status",
  verifyAuth,
  rateLimiter,
  checkAndUpdateGitHubStatus
);
userRoutes.post("/correctanswer", rateLimiter, increaseStreak);
userRoutes.post("/incorrectanswer", rateLimiter, resetStreak);
userRoutes.post("/finishquiz", rateLimiter, devQuestionsAnsweredData);
userRoutes.post("/addEducation", verifyAuth, rateLimiter, addEducation);
userRoutes.put("/editEducation", verifyAuth, rateLimiter, editEducation);
userRoutes.delete("/deleteEducation", verifyAuth, rateLimiter, deleteEducation);
userRoutes.post("/addConnectedApps", verifyAuth, rateLimiter, addConnectedApp);
userRoutes.put("/editConnectedApps", verifyAuth, rateLimiter, editConnectedApp);
userRoutes.delete(
  "/deleteConnectedApps",
  verifyAuth,
  rateLimiter,
  deleteConnectedApp
);
userRoutes.get("/leaderBoard", rateLimiter, displayLeaderBoard);
userRoutes.post("/addLanguages", verifyAuth, rateLimiter, addLanguage);
userRoutes.delete("/deleteLanguages", verifyAuth, rateLimiter, removeLanguage);
userRoutes.post("/addSkills", verifyAuth, rateLimiter, addSkill);
userRoutes.delete("/deleteSkills", verifyAuth, rateLimiter, deleteSkill);

export default userRoutes;
