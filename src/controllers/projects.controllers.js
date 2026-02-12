import { asyncHandler } from "../utils/async-handler.js";
import {ApiError} from "../utils/api-error.js"
import {ApiResponse} from "../utils/api-response.js"
import {projectTable} from "../models/project.models.js"
import {projectMember} from "../models/projectMemberRole.model.js"


export const createProject = asyncHandler(async (req, res) => {
    const {name, description = "", settings = {}} = req.body;

    // validation checks
    if(!name || name.trim() === ""){
        throw new ApiError(400, "Project name is required")
    }

    // create project into database
    const project = await projectTable.create({
        name: name.trim(),
        description: description.trim(),
        createdBy: req.user._id,
        settings: {
            visibility: settings.visibility || "private",
            defaultTaskStatus: settings.defaultTaskStatus || "to-do",
            allowGuestAccess: settings.allowGuestAccess || false,
        },
        metadata: {
            totalTasks: 0,
            completedTasks: 0,
            totalMembers: 1,
            lastActivity: Date.now(),
        }
    });

    // creator becomes admin of the project
    await projectMember.create({
        user: req.user._id,
        project: project._id,
        role: "admin",
        permissions: {
            canCreateTasks: true,
            canEditTasks: true,
            canDeleteTasks: true,
            canManageMembers: true,
            canViewReports: true,
        },
        invitedBy: req.user._id,
    })

    // response to client
    res.status(201).json(new ApiResponse(201, "Project created successfully", project));
})




export const listMyProjects = asyncHandler(async (req, res) => {
    // finding all projects on behalf of user ID
    const membership = await projectMember.find({user: req.user._id}).populate("project").sort({createdAt: -1})

    // modified membership array to get only 2 properties of project & role
    const projects = membership
        .filter((m)=>(m.project && !m.project.isArchived))
        .map((m)=>({
            project: m.project,
            role: m.role
        }))

    // response back to client
    return res.status(200).json(new ApiResponse(200, {projects}, " projects fetched successfully") )

})