import express from "express";
import {
  joinTeam,
  handleRequests,
  searchTeamByCode,
  createTeam,
  getPendingRequests,
  getTeamById,
} from "../controllers/team.controllers.js";
import { verifyAuth } from "../middlewares/userAuth.js";
import rateLimit from "express-rate-limit";

const teamRoutes = express.Router();

const getLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 400,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: "Too many requests, please try again later.",
    });
  },
});

const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: "Too many requests, please try again later.",
    });
  },
});

teamRoutes.post("/create", verifyAuth, getLimiter, createTeam);
teamRoutes.post("/join", verifyAuth, strictLimiter, joinTeam);
teamRoutes.post(
  "/pendingRequests",
  verifyAuth,
  getLimiter,
  getPendingRequests
);
teamRoutes.post("/handleRequest", verifyAuth, strictLimiter, handleRequests);
teamRoutes.get(
  "/search/:secretCode",
  verifyAuth,
  getLimiter,
  searchTeamByCode
);
teamRoutes.get("/:teamId", verifyAuth, getLimiter, getTeamById);

export default teamRoutes;
