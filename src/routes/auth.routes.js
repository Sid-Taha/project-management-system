// src\routes\auth.routes.js
import express from "express"
import {registerUser, login, verifyEmail, logoutUser, resendEmailVerification, getCurrentUser, refreshAccessToken, forgetPasswordRequest, resetForgotPassword, changeCurrentPassword, cbFunction}  from "../controllers/auth.controllers.js"
import {verifyJWT, passAuth} from "../middlewares/auth.middleware.js"

const router = express.Router()

// localhost:8000/api/v1/auth/register = signup route
router.route("/register").post(registerUser) // user registration route

router.route("/verify-email/:verificationToken").get(verifyEmail) // email verification route

router.route("/resend-email-verification").get(resendEmailVerification) // resend email verification route

router.route("/login").post(login) // user login route

router.route("/logout").post(verifyJWT, logoutUser) // user logout route

router.route("/current-user").post(verifyJWT, getCurrentUser) // get current logged in user route

router.route("/refresh-token").post(refreshAccessToken) // refresh access token route

router.route("/forget-password").post(forgetPasswordRequest) // forget password route

router.route("/reset-password/:resetToken").get(resetForgotPassword) // reset password route

router.route("/change-password").post(verifyJWT, changeCurrentPassword) // change password route




import passport from "../config/passport.js"
// ----------------------------------  login with google ----------------------------------  
// redirect user to google
router.route("/google").get(passport.authenticate("google", {scope: ["profile", "email"]})) 

// google redirects back here after login
router.route("/google/callback").all(passAuth).get(cbFunction)

// Failure route
router.route("/google/failure").get((req, res)=>{
    return res.status(401).json({message: "Google authentication failed /google/failure"})
}) 


export default router