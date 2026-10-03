import { DailyService } from "./daily.service.js";
import { DailyRepository } from "../../repositories/daily.repository.js";
import { logger } from "../../utils/logger.js";

export const dailyService = new DailyService(new DailyRepository(), logger);
