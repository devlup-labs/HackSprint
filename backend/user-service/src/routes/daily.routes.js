import { Router } from "express";
import { getToday, answerToday, getActivity } from "../controllers/daily.controller.js";
import { verifyAuth } from "../middlewares/userAuth.js";

const router = Router();

router.get("/today", verifyAuth, getToday);
router.post("/answer", verifyAuth, answerToday);
router.get("/activity", verifyAuth, getActivity);

export default router;
