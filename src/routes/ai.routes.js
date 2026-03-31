import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { requireProjectMember } from "../middlewares/project.middleware.js";
import {suggestTasks, analyzeRisks, predictTimeline, balanceWorkload, smartAssignTask, prioritizeTask, summarizeMeeting} from "../controllers/ai.controllers.js"

const router = express.Router();

router.use(verifyJWT)

// localhost:8000/api/v1/ai/xxxx-xxxx/:projectId
router.route("/suggest-tasks/:projectId").all(requireProjectMember).post(suggestTasks)
router.route("/analyze-risks/:projectId").all(requireProjectMember).get(analyzeRisks)
router.route("/predict-timeline/:projectId").all(requireProjectMember).get(predictTimeline)
router.route("/balance-workload/:projectId").all(requireProjectMember).get(balanceWorkload)

// no need of project membership, just need to be logged in to assign task smartly
// localhost:8000/api/v1/ai/xxxx-xxxx/:taskId
router.route("/assign-task/:taskId").post(smartAssignTask)
router.route("/prioritize/:taskId").post(prioritizeTask)

// General AI features that are not project specific
router.route("/summarize-meeting").post(summarizeMeeting)

export default router;