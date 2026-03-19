import { asyncHandler } from "../utils/async-handler.js";
import {ApiError} from "../utils/api-error.js"
import {tableTask} from "../models/task.model.js"
import {subtaskTable} from "../models/subtask.model.js"
import { ApiResponse } from "../utils/api-response.js";


export const listSubtasks = asyncHandler(async (req, res) => {
    // localhost:8000//api/v1/tasks/:projectId/t/:taskId/subtasks
    const {projectId, taskId} = req.params
    if(!(projectId && taskId)) throw new ApiError(400, "projectId & taskId is missing")

    const task = await tableTask.findOne({_id: taskId, project: projectId})
    if(!task) throw new ApiError(404, "Task not found into Database because of wrong taskId or projectId")

    // projectId, taskId ==> subTask -> Database
    const subtasks = await subtaskTable.find({task: taskId})
    if(subtasks.length < 1) return res.status(200).json(new ApiResponse(200, subtasks, "no subtask found into database"))

    return res.status(200).json(new ApiResponse(200, subtasks, "subtask fetched successfully"))
})





export const createSubtask = asyncHandler(async (req, res) => {
    const {projectId, taskId} = req.params
    if(!(projectId && taskId)) throw new ApiError(400, "projectId & taskId is missing")

    // find task into database with taskId and projectId
    const task = await tableTask.findOne({_id: taskId, project: projectId})
    if(!task) throw new ApiError(404, "Task not found into Database because of wrong taskId or projectId so you can't create subtask")

    // create subtask into database with taskId and projectId
    const subtask = await subtaskTable.create({
        title: req.body.title,
        task: taskId,
        project: projectId,
        createdBy: req.user._id
    })

    return res.status(201).json(new ApiResponse(201, subtask, "subtask created successfully"))
})






export const updateSubtask = asyncHandler(async (req, res) => {
    // ---------------------------  1. Receivable  (req.param, req.query, req.body)  ---------------------------
    const {projectId, taskId, subtaskId} = req.params
    if(!(projectId && taskId && subtaskId)) throw new ApiError(400, "projectId & taskId & subtaskId is missing")

    const {title, isCompleted} = req.body
    if(title === undefined && isCompleted === undefined) throw new ApiError(400, "title or isCompleted is required to update subtask")

    // ---------------------------  2. exist or not (Receivable)  ---------------------------
    // find task into database with taskId and projectId
    const task = await tableTask.findOne({_id: taskId, project: projectId})
    if(!task) throw new ApiError(404, "Task not found into Database because of wrong taskId or projectId")

    // find subtask into database with subtaskId and taskId and projectId
    const subtask = await subtaskTable.findOne({_id: subtaskId, task: taskId, project: projectId})
    if(!subtask) throw new ApiError(404, "Subtask not found into Database because of wrong subtaskId or taskId or projectId")

    // ---------------------------  3. according to condition (Receivable)  ---------------------------
    // skipped

    // ---------------------------  4. database manipulation (according to schema)  ---------------------------
    if(title !== undefined) subtask.title = title

    if(isCompleted == true) {
        subtask.isCompleted = true
        subtask.completeAt =  new Date()
    }

    await subtask.save()
    
    // ---------------------------  5. Response   ---------------------------
    return res.status(200).json(new ApiResponse(200, subtask, "subtask updated successfully"))
})







export const deleteSubtask = asyncHandler(async (req, res) => {
    // ---------------------------  1. Receivable  (req.param, req.query, req.body)  ---------------------------
    const {projectId, taskId, subtaskId} = req.params
    if(!(projectId && taskId && subtaskId)) throw new ApiError(400, "projectId & taskId & subtaskId is missing")

    // ---------------------------  2. exist or not (Receivable)  ---------------------------
    // find task into database with taskId and projectId
    const task = await tableTask.findOne({_id: taskId, project: projectId})
    if(!task) throw new ApiError(404, "Task not found into Database because of wrong taskId or projectId")

    // find subtask into database with subtaskId and taskId and projectId
    const subtask = await subtaskTable.findOne({_id: subtaskId, task: taskId, project: projectId})
    if(!subtask) throw new ApiError(404, "Subtask not found into Database because of wrong subtaskId or taskId or projectId")

    // ---------------------------  3. according to condition (Receivable)  ---------------------------
    // skipped

    // ---------------------------  4. database manipulation (according to schema)  ---------------------------
    await subtask.deleteOne({_id: subtaskId})
    
    // ---------------------------  5. Response   ---------------------------
    return res.status(200).json(new ApiResponse(200, null, "subtask deleted successfully"))
})