import express from 'express'
import { Router } from 'express'

import { sendExpiredHackathons, sendHackathons,sendInactiveHackathons,addhackathons,sendUpcomingHackathons,sendDetailsOfId} from '../controllers/hackathon.controllers.js'
const hackathonRoutes = Router();

hackathonRoutes.get("/", sendHackathons)
hackathonRoutes.get("/inactiveHackathons",sendInactiveHackathons)
hackathonRoutes.get("/expiredHackathons",sendExpiredHackathons)

hackathonRoutes.get("/upcomingHackathons",sendUpcomingHackathons)
hackathonRoutes.get("/:id", sendDetailsOfId);
hackathonRoutes.post("/hackathons",addhackathons);

export default hackathonRoutes