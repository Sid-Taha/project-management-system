// src\routes\auth.routes.js
import express from "express"
import {registerUser, login, verifyEmail}  from "../controllers/auth.controllers.js"

const router = express.Router()

// localhost:8000/api/v1/auth/register = signup route
router.route("/register").post(registerUser) // user registration route

router.route("/login").post(login) // user registration route

router.route("/verify-email/:verificationToken").get(verifyEmail) // email verification route


export default router