import express from 'express'
import { Router } from 'express'
import { checkAndUpdateGitHubStatus, saveGitHubLink, resetStreak, increaseStreak, devQuestionsAnsweredData, addConnectedApp, deleteConnectedApp, editConnectedApp, displayLeaderBoard, addEducation, editEducation, deleteEducation, addLanguage, removeLanguage, addSkill, deleteSkill } from '../controllers/user.controllers.js';
import { userAuth, verifyAuth } from '../middlewares/userAuth.js';

const userRoutes = Router();

userRoutes.put("/save-gitHubLink", verifyAuth, saveGitHubLink);
userRoutes.get("/submission/github-status", verifyAuth, checkAndUpdateGitHubStatus);
userRoutes.post("/correctanswer", increaseStreak);
userRoutes.post("/incorrectanswer", resetStreak);
userRoutes.post("/finishquiz", devQuestionsAnsweredData);
userRoutes.post("/addEducation", verifyAuth, addEducation);
userRoutes.put("/editEducation", verifyAuth, editEducation);
userRoutes.delete("/deleteEducation", verifyAuth, deleteEducation);
userRoutes.post("/addConnectedApps", verifyAuth, addConnectedApp);
userRoutes.put("/editConnectedApps", verifyAuth, editConnectedApp);
userRoutes.delete("/deleteConnectedApps", verifyAuth, deleteConnectedApp);
userRoutes.get("/leaderBoard", displayLeaderBoard);
userRoutes.post("/addLanguages", verifyAuth, addLanguage);
userRoutes.delete("/deleteLanguages", verifyAuth, removeLanguage);
userRoutes.post("/addSkills", verifyAuth, addSkill);
userRoutes.delete("/deleteSkills", verifyAuth, deleteSkill);

export default userRoutes;