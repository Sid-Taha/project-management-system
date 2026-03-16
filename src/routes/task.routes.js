import express from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { requireProjectAdmin, requireProjectMember } from "../middlewares/project.middleware.js"
import { createTask, listTask, getTaskDetails, updateTask, deleteTask } from "../controllers/task.controllers.js"


const router = express.Router()


router.use(verifyJWT) // checking your login status


router.route("/:projectId").all(requireProjectMember, requireProjectAdmin).post(createTask)

router.route("/:projectId").all(requireProjectMember).get(listTask)

router.route("/:projectId/:taskId").all(requireProjectMember).get(getTaskDetails)

router.route("/:projectId/:taskId").all(requireProjectMember, requireProjectAdmin).put(updateTask)

router.route("/:projectId/:taskId").all(requireProjectMember, requireProjectAdmin).delete(deleteTask)





export default router