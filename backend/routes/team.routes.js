import express from "express"
import { joinTeam, handleRequests, searchTeamByCode, createTeam, getPendingRequests, getTeamById } from "../controllers/team.controllers.js";
import { verifyAuth } from "../middlewares/userAuth.js";

const teamRoutes = express.Router();

teamRoutes.post("/create", verifyAuth, createTeam);
teamRoutes.post("/join", verifyAuth, joinTeam);
teamRoutes.post("/pendingRequests", verifyAuth, getPendingRequests);
teamRoutes.post("/handleRequest", verifyAuth, handleRequests);
teamRoutes.get("/search/:secretCode", verifyAuth, searchTeamByCode)
teamRoutes.get("/:teamId", verifyAuth, getTeamById);

export default teamRoutes;