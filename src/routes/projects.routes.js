import express from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { createProject, listMyProjects } from "../controllers/projects.controllers.js"


const router = express.Router()

// middleware
router.use(verifyJWT)

// http://localhost:8000/api/v1/project 

// APIs
router.route("/").post(createProject).get(listMyProjects)


export default router