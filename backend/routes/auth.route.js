import express from 'express'
import { googleLogin, login, resetPassword, sendResetLink, signup, verifyEmail } from '../controllers/auth.controller.js'
import { loginValidation, signupValidation } from "../middlewares/authValidation.js"
// import { verifyAuth } from '../middlewares/userAuth.js'

const router = express.Router()

router.post("/signup", signupValidation, signup)

// router.post("/verify-email", verifyAuth, verifyEmail)
router.get("/verify-email", verifyEmail)

// router.post("/send-reset-otp", sendResetOTP)
// router.post("/reset-password", resetPassword)

router.post("/send-reset-link", sendResetLink);
router.post("/reset-password", resetPassword);

router.post("/login", loginValidation, login)

router.get("/google", googleLogin)

export default router