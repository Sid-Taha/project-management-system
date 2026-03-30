import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { requireProjectMember } from "../middlewares/project.middleware.js";
import {suggestTasks, analyzeRisks, predictTimeline, balanceWorkload} from "../controllers/ai.controllers.js"

const router = express.Router();

router.use(verifyJWT)

// localhost:8000/api/v1/ai/suggest-tasks/:projectId


router.route("/suggest-tasks/:projectId").all(requireProjectMember).post(suggestTasks)

router.route("/analyze-risks/:projectId").all(requireProjectMember).get(analyzeRisks)

router.route("/predict-timeline/:projectId").all(requireProjectMember).get(predictTimeline)

router.route("/balance-workload/:projectId").all(requireProjectMember).get(balanceWorkload)

export default router;