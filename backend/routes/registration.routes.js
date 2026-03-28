import express from "express";
import RegisteredParticipantsModel from "../models/registeredParticipants.js";
import { isregistered, registerParicipants , registerTeam} from "../controllers/registration.controllers.js";
import { verifyAuth } from "../middlewares/userAuth.js";

const router = express.Router();

router.post("/:hackathonId", verifyAuth, registerParicipants);
// router.post("/:hackathonId/team" ,  verifyAuth, registerTeam);
router.get("/:hackathonId/:userId" , verifyAuth, isregistered);
export default router;
