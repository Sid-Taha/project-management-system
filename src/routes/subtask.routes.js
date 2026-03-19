import express from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { requireProjectMember } from "../middlewares/project.middleware.js"
import {listSubtasks, createSubtask, updateSubtask, deleteSubtask} from "../controllers/subtask.controllers.js"

const router = express.Router()

router.use(verifyJWT)

// localhost:8000//api/v1/tasks/:projectId/t/:taskId/subtasks
router.route("/:projectId/t/:taskId/subtasks").all(requireProjectMember).get(listSubtasks)

router.route("/:projectId/t/:taskId/subtasks").all(requireProjectMember).post(createSubtask)


router.route("/:projectId/t/:taskId/subtasks/:subtasksId").all(requireProjectMember).patch(updateSubtask)

router.route("/:projectId/t/:taskId/subtasks/:subtasksId").all(requireProjectMember).delete(deleteSubtask)

export default router