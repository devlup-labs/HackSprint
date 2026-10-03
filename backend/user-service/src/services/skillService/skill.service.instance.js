import { SkillService } from "./skill.service.js";
import { SkillRepository } from "../../repositories/skill.repository.js";
import { logger } from "../../utils/logger.js";

export const skillService = new SkillService(new SkillRepository(), logger);
