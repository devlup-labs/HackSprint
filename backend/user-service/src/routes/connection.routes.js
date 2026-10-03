import { Router } from "express";
import {
  sendRequest,
  acceptRequest,
  declineRequest,
  listFriends,
  getStatuses,
} from "../controllers/connection.controller.js";
import { verifyAuth } from "../middlewares/userAuth.js";

const router = Router();

router.get("/", verifyAuth, listFriends);
router.get("/statuses", verifyAuth, getStatuses);
router.post("/:userId/request", verifyAuth, sendRequest);
router.post("/:id/accept", verifyAuth, acceptRequest);
router.post("/:id/decline", verifyAuth, declineRequest);

export default router;
