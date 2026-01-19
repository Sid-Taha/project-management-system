// src\routes\auth.routes.js
import express from "express"
import {registerUser}  from "../controllers/auth.controllers.js"

const router = express.Router()

// localhost:8000/api/v1/auth/register
router.route("/register").post(registerUser) // user registration route


export default router