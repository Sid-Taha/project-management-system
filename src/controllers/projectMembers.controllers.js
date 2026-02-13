import { asyncHandler } from "../utils/async-handler.js";
import {projectMember} from "../models/projectMemberRole.model.js"
import { ApiResponse } from "../utils/api-response";
import { ApiError } from "../utils/api-error";



export const listProjectMember = asyncHandler( async (req, res) => {
    // Get the projectId from the request parameters
    const { projectId } = req.params;

    // throw error if projectId is not provided
    if (!projectId) {
        return res.status(400).json(new ApiError(400, "Project ID is required"));
    }

    // Find all project members for the given projectId
    const members = await projectMember.find({project: projectId})
    .populate("user", "name email")
    .sort({createdAt: -1})

    // Return the list of project members
    res.status(200).json(new ApiResponse(200, members, "Project members fetched successfully"));
})