import express from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { requireProjectAdmin, requireProjectMember } from "../middlewares/project.middleware.js"
import { createTask, listTask, getTaskDetails, updateTask, deleteTask } from "../controllers/task.controllers.js"
import { uploadTaskAttachments } from "../middlewares/upload.middleware.js"


const router = express.Router()


router.use(verifyJWT) // checking your login status


router.route("/:projectId").all(requireProjectMember, uploadTaskAttachments.array("attachments", 10), requireProjectAdmin).post(createTask) // create task

router.route("/:projectId").all(requireProjectMember).get(listTask) // list all task

router.route("/:projectId/:taskId").all(requireProjectMember).get(getTaskDetails) // get task details

router.route("/:projectId/:taskId").all(requireProjectMember, requireProjectAdmin).put(updateTask) // update task

router.route("/:projectId/:taskId").all(requireProjectMember, requireProjectAdmin).delete(deleteTask) // delete task (only admin can delete task)





export default router