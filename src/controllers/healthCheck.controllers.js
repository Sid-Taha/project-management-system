// src\controllers\healthCheck.controllers.js
import {ApiResponse} from "../utils/api-response.js"
import { asyncHandler } from "../utils/async-handler.js"


const healthCheck = asyncHandler( async (req, res) => {
    res.status(200).json(new ApiResponse(200, null, "API is healthy"));
})

export {healthCheck}