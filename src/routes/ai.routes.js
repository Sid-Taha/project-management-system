import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { requireProjectMember } from "../middlewares/project.middleware.js";
import {suggestTasks, analyzeRisks} from "../controllers/ai.controllers.js"

const router = express.Router();

router.use(verifyJWT)

// localhost:8000/api/v1/ai/suggest-tasks/:projectId


router.route("/suggest-tasks/:projectId").all(requireProjectMember).post(suggestTasks)

router.route("/analyze-risks/:projectId").all(requireProjectMember).get(analyzeRisks)



export default router;