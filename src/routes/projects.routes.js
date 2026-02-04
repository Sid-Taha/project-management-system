import express from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { createProject } from "../controllers/projects.controllers.js"


const router = express.Router()

router.use(verifyJWT)

// http://localhost:8000/api/v1/project

router.route("/").post(createProject)

export default router