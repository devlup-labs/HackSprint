import { CacheService } from "./cache.service.js";
import { redisClient } from "../../config/redis.js";
import { logger } from "../../utils/logger.js";

export const cacheService = new CacheService(redisClient, logger);
