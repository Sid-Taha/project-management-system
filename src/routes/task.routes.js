import express from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { requireProjectAdmin, requireProjectMember } from "../middlewares/project.middleware.js"
import { createTask, listTask } from "../controllers/task.controllers.js"


const router = express.Router()


router.use(verifyJWT) // checking your login status


router.route("/:projectId").all(requireProjectMember, requireProjectAdmin).post(createTask)

router.route("/:projectId").all(requireProjectMember).get(listTask)








export default router