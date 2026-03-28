import express from 'express'
import { googleLogin, githubLogin, login, resetPassword, sendResetLink, signup, verifyEmail } from '../controllers/auth.controller.js'
import { loginValidation, signupValidation } from "../middlewares/authValidation.js"

const router = express.Router()

// router.post("/signup", signupValidation, signup)
router.get("/verify-email", verifyEmail)
router.post("/send-reset-link", sendResetLink);
router.post("/reset-password", resetPassword);
// router.post("/login", loginValidation, login)
router.get("/google", googleLogin)
router.get("/auth/callback/github", githubLogin)

export default router