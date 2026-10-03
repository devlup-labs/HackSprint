import { Router } from "express";
import { searchSkills } from "../controllers/skill.controller.js";

const router = Router();

router.get("/search", searchSkills);

export default router;
