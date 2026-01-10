// src\routes\auth.routes.js
import express from "express"
import {registerUser}  from "../controllers/auth.controllers"

const router = express.Router()

router.route("/register").post(registerUser)


export default router