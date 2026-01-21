import { Router } from "express";
import { getMessages, getUserChats } from "../controllers/chat.controller.js";
import { verifyAuth } from "../middlewares/userAuth.js";

const chatRoutes = Router();

// chatRoutes.get("/:chatId", verifyAuth, getMessages);
// chatRoutes.get("/user/chats", verifyAuth, getUserChats);
chatRoutes.get("/:chatId", getMessages);
chatRoutes.get("/user/chats", getUserChats);

export default chatRoutes;
