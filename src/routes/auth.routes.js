// src\routes\auth.routes.js
import express from "express"
import {registerUser, login}  from "../controllers/auth.controllers.js"

const router = express.Router()

// localhost:8000/api/v1/auth/register = signup route
router.route("/register").post(registerUser) // user registration route

router.route("/login").post(login) // user registration route


export default router