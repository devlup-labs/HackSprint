import { logger } from "../../utils/logger.js";
import { adminRepository } from "../../repositories/admin.repository.instance.js";
import { PlatformUserService } from "./platformUser.service.js";

export const platformUserService = new PlatformUserService(adminRepository, logger);
