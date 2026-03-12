// src\routes\projectMembers.routes.js
import express from "express"
import {listProjectMember, addProjectMember, updateProjectMember, removeProjectMember} from "../controllers/projectMembers.controllers.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { requireProjectMember, requireProjectAdmin } from "../middlewares/project.middleware.js"
  

const router = express.Router()


// ---------------------------------------Middlewares
router.use(verifyJWT) // your are login



// ---------------------------------------API routes
router.route("/:projectId/members").all(requireProjectMember).get(listProjectMember) // show all members

router.route("/:projectId/members").all(requireProjectMember).post(requireProjectAdmin ,addProjectMember) // add a member

router.route("/:projectId/members/:userId").all(requireProjectMember).put(requireProjectAdmin, updateProjectMember) // Update Member Role / Permissions

router.route("/:projectId/members/:userId").all(requireProjectMember).delete(requireProjectAdmin, removeProjectMember) // remove user from project



export default router