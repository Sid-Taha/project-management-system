// src\routes\healthCheck.routes.js
import express from "express"
import {healthCheck} from "../controllers/healthCheck.controllers.js"

const router = express.Router()

router.route("/").get(healthCheck)

// router.get("/", healthCheck)

export default router