import { asyncHandler } from "../utils/async-handler.js";
import {ApiError} from "../utils/api-error.js"
import {projectTable} from "../models/project.models.js"
import {noteTable} from "../models/note.model.js"
import {ApiResponse} from "../utils/api-response.js"

 
 
 
 export const createNote = asyncHandler(async (req, res) => {
    const {projectId} = req.params
    if(!projectId) throw new ApiError(400, "Project ID is required")

    const {title, content, tags, isPinned} = req.body
    if(!title || !content) throw new ApiError(400, "Title and content are required")

    const project = await projectTable.findById(projectId)
    if(!project) throw new ApiError(404, "Project not found")

    const note = await noteTable.create({
        title: title,
        content: content,
        projectId: projectId,
        createdBy: req.user._id,
        tags: tags || [],
        isPinned: isPinned || false,
    })

    return res.status(201).json(new ApiResponse(201, note, "Note created successfully"))
 })





 const listNotes = asyncHandler(async (req, res) => {
    const {projectId} = req.params
    if(!projectId) throw new ApiError(400, "Project ID is required")

    const { search, tags, pinned, sort } = req.query

    const filter = { projectId }

    if (search) filter.$text = { $search: search }

    if (tags) filter.tags = { $in: tags.split(",") }

    if (pinned) filter.isPinned = pinned === "true"

    const notes = await noteTable.find(filter)

    return res.status(200).json(new ApiResponse(200, notes, "Notes fetched successfully"))
 })