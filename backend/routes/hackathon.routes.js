import express from 'express'
import { Router } from 'express'
import { sendExpiredHackathons, sendHackathons,sendInactiveHackathons,addhackathons,registerParticipants ,getParticularHackathon, sendUpcomingHackathons} from '../controllers/hackathon.controllers.js'
import { verifyAuth } from '../middlewares/userAuth.js';


const hackathonRoutes = Router();

hackathonRoutes.get("/", sendHackathons);
hackathonRoutes.get("/inactiveHackathons", sendInactiveHackathons);
hackathonRoutes.get("/expiredHackathons", sendExpiredHackathons);
hackathonRoutes.get("/upcomingHackathons", sendUpcomingHackathons);
hackathonRoutes.post("/", addhackathons);
hackathonRoutes.post("/register", verifyAuth, registerParticipants);
hackathonRoutes.get("/:id", getParticularHackathon);

export default hackathonRoutes