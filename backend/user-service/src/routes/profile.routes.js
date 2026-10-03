import { Router } from "express";
import {
  getMyProfile,
  getPublicProfile,
  getPeople,
  getPeopleStats,
  getCampus,
  getDistrictPeople,
  getSuggestedPeople,
  searchProfiles,
  updateProfile,
  addEducation,
  updateEducation,
  removeEducation,
  addConnectedApp,
  updateConnectedApp,
  removeConnectedApp,
  updateSkills,
  checkUserName,
  updateAvatar
} from "../controllers/profile.controller.js";
import { verifyAuth } from "../middlewares/userAuth.js";

const router = Router();

router.get("/me", verifyAuth, getMyProfile);
router.patch("/me", verifyAuth, updateProfile);
router.get("/search", searchProfiles);
// Must come before "/:userName" — otherwise Express would treat "people" as
// a userName value and route it to getPublicProfile instead.
router.get("/people", getPeople);
router.get("/people/campus", getCampus);
router.get("/people/district/:districtId", getDistrictPeople);
router.get("/people/stats", getPeopleStats);
router.get("/people/suggested", verifyAuth, getSuggestedPeople);
router.get("/check-username/:userName", verifyAuth, checkUserName);
router.get("/:userName", getPublicProfile);
router.post("/me/education", verifyAuth, addEducation);
router.patch("/me/education/:id", verifyAuth, updateEducation);
router.delete("/me/education/:id", verifyAuth, removeEducation);
router.post("/me/apps", verifyAuth, addConnectedApp);
router.patch("/me/apps/:id", verifyAuth, updateConnectedApp);
router.delete("/me/apps/:id", verifyAuth, removeConnectedApp);
router.put("/me/skills", verifyAuth, updateSkills);
router.patch("/me/avatar", verifyAuth, updateAvatar);

export default router;
