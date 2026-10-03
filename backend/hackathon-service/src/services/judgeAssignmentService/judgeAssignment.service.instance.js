import { logger } from "../../utils/logger.js";
import { JudgeAssignmentRepository } from "../../repositories/judgeAssignment.repository.js";
import { HackathonRepository } from "../../repositories/hackathon.repository.js";
import { JudgeAssignmentService } from "./judgeAssignment.service.js";
import { AdminRepository } from "../../repositories/admin.repository.js";
import { NotificationClient } from "../../clients/notification.client.js";

const judgeAssignmentRepository = new JudgeAssignmentRepository();

const hackathonRepository = new HackathonRepository();

const adminRepository = new AdminRepository();

export const judgeAssignmentService = new JudgeAssignmentService(
  judgeAssignmentRepository,
  hackathonRepository,
  adminRepository,
  logger,
  new NotificationClient(logger)
);
