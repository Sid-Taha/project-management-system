// src\routes\auth.routes.js
import express from "express"
import {registerUser, login, verifyEmail, logoutUser, resendEmailVerification, getCurrentUser}  from "../controllers/auth.controllers.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"

const router = express.Router()

// localhost:8000/api/v1/auth/register = signup route
router.route("/register").post(registerUser) // user registration route

router.route("/verify-email/:verificationToken").get(verifyEmail) // email verification route

router.route("/resend-email-verification").get(resendEmailVerification) // resend email verification route

router.route("/login").post(login) // user login route

router.route("/logout").post(verifyJWT, logoutUser) // user logout route

router.route("/current-user").post(verifyJWT, getCurrentUser) // get current logged in user route






export default router