// src\middlewares\auth.middleware.js
import { asyncHandler } from "../utils/async-handler.js";
import {userTable} from "../models/user.models.js"
import {ApiError} from "../utils/api-error.js"
import jwt from "jsonwebtoken"
import passport from "../config/passport.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
    // getting client token from cookies
    const token = req.cookies?.accessToken 
    // if token is not present, throw error
    if(!token){
        throw new ApiError(401, "Access token is missing")
    }

    try {
        // token decoded from jwt
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        // find the user associated with the token
        const user = await userTable.findById(decodedToken._id).select("-password -refreshToken -emailVerificationToken -emailVerificationTokenExpiry") 

        // if user not found, throw error
        if(!user){
            throw new ApiError(404, "User not found")
        }

        // attach user to request object
        req.user = user

        next() // proceed to api function
    } catch (error) {
        throw new ApiError(401, "Invalid or expired access token")
    }
});






export const passAuth = (req, res, next)=>{
    
    passport.authenticate("google", {session: false}, (err, user, info)=>{
        console.log("❌ err", err);
        console.log("✅ user", user);
        console.log("✅ info", info);
        
        if(err || !user){
            return res.status(401).json(
                {
                    message: "Goooooooooooooogle Authentication failed",
                    error: err?.message || info
                }
            )
        }

        req.user = user
        next()
    })(req, res, next)
}