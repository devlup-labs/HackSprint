import { Router } from "express";
import { sendMessage, listMessages } from "../controllers/message.controller.js";
import { verifyAuth } from "../middlewares/userAuth.js";

const router = Router();

router.get("/:friendId", verifyAuth, listMessages);
router.post("/:friendId", verifyAuth, sendMessage);

export default router;
