import { projectMember } from "../models/projectMemberRole.model.js"
import { ApiError } from "../utils/api-error.js"

export const requireProjectMember = async (req, res, next) => {
    // Get the projectId from the request parameters
    const { projectId } = req.params;

    // finding the membership of the user in the project
    const membership = await projectMember.findOne({
        user: req.user._id,
        project: projectId
    })

    // if membership not found, throw error
    if(!membership){
        return res.status(403).json(new ApiError(403, "You are not a member of this project"))
    }

    // attach membership to request object for further use
    req.membership = membership
    next() // proceed to api function
}