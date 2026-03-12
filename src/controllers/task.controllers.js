import { asyncHandler } from "../utils/async-handler.js";
import { projectMember } from "../models/projectMemberRole.model.js"
import { tableTask } from "../models/task.model.js"
import {projectTable} from "../models/project.models.js"
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";


export const createTask = asyncHandler(async (req, res) => {
    // Verify project exists
    const {projectId} = req.params

    // Extract task details from request body
    const {
    title,
    description,
    assignedTo,
    status = "todo",
    priority = "medium",
    dueDate,
    estimatedHours,
    tags,
    attachments
    } = req.body

    // if title is not provided, throw error
    if(!title){
        throw new ApiError(400, "Title is required")
    }

    // if status is provided, validate it
    const project  = await projectTable.findById(projectId)
    if(!project){
        throw new ApiError(404, "Project not found")
    }

    // if assignedTo is provided, validate it
    const member = await projectMember.findOne({
        project: projectId,
        user: assignedTo
    })
    if(!member){
        throw new ApiError(404, "Project member not found")
    }

    // Validate due date
    if (dueDate && new Date(dueDate) < new Date()) {
        throw new ApiError(400, "Due date cannot be in the past")
    }

    // Validate status and priority
    const validStatuses = ["todo", "in-progress", "done"]
    const validPriorities = ["low", "medium", "high", "critical"]

    if (status && !validStatuses.includes(status)) {
        throw new ApiError(400, `Invalid status. Valid options are: ${validStatuses.join(", ")}`)
    }

    if (priority && !validPriorities.includes(priority)) {
        throw new ApiError(400, `Invalid priority. Valid options are: ${validPriorities.join(", ")}`)
    }


    // Create task
    const task = await tableTask.create({
        title: title,
        description: description,
        project: projectId,
        assignedTo: assignedTo || null,
        assignedBy: req.user._id,
        status: status,
        priority: priority,
        dueDate: dueDate || null,
        estimatedHours: estimatedHours || 0,
        tags: tags || [],
        attachments: attachments || []
    })

    // if task creation failed, throw error
    if(!task){
        throw new ApiError(500, "Failed to create task")
    }

    // Update project metadata
    await projectTable.findByIdAndUpdate(projectId, {
        $inc: { "metadata.totalTasks": 1 },
        $set: { "metadata.lastActivity": new Date() }
    }).exec()


    return res.status(201).json(
        new ApiResponse(201, task, "Task created successfully")
    )

})  







export const listTask = asyncHandler(async (req, res) => {
    // get project id from url
    const {projectId} = req.params

    // Verify project exists
    const project  = await projectTable.findById(projectId)
    if(!project){
        throw new ApiError(404, "Project not found")
    }

    // extract query params for filtering
    const {
        status,
        priority,
        assignedTo,
        tags,
        search,
        sort,
        page,
        limit,
        dueDate
    } = req.query

    // Build filter object based on query params
    const filter = { project: projectId }

    if (status) filter.status = status
    if (priority) filter.priority = priority
    if (assignedTo) filter.assignedTo = assignedTo
    if (tags) filter.tags = { $all: tags.split(",") }
    if (search) filter.title = { $regex: search, $options: "i" }
    if (dueDate) filter.dueDate = { $lte: new Date(dueDate) }

    // pagination
    const pageNum = Math.max(1, parseInt(page) || 1) // default to page 1 if not provided or invalid
    const limitNum = Math.min(100, parseInt(limit) || 10) // default to 10 items per page, max 100
    const skip = (pageNum - 1) * limitNum // calculate how many items to skip based on current page and limit

    // sorting
    const validSort = ["createdAt", "dueDate", "priority", "status"]
    const sortField = validSort.includes(sort) ? sort : "createdAt" // default to sorting by creation date
    const sortOrder = sort === "dueDate" ? 1 : -1 // sort by due date in ascending order, others in descending

    // fetch task + total count in parallel
    const [tasks, totalCount] = await Promise.all([
        tableTask.find(filter).sort({ [sortField]: sortOrder }).skip(skip).limit(limitNum).exec(),
        tableTask.countDocuments(filter).exec()
    ])

    // return response with tasks and pagination info
    return res.status(200).json(
        new ApiResponse(200, {
            tasks,
            pagination: {
                total: totalCount,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(totalCount / limitNum)
            }
        }, "Tasks fetched successfully")
    )


})