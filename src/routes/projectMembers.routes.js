// src\routes\projectMembers.routes.js
import express from "express"
import {listProjectMember} from "../controllers/projectMembers.controllers.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { requireProjectMember, requireProjectAdmin } from "../middlewares/project.middleware.js"
  
const router = express.Router()

router.use(verifyJWT) // this will verify the token for all routes in this router
router.use(requireProjectMember) // this will check if the user is a member of this project


router.route("/").get(listProjectMember) // list all members of a project

router.route("/").post(requireProjectAdmin ,addProjectMember) // add a member to a project

export default router