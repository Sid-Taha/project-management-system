import { ApiResponse } from "../utils/api-response"
import { asyncHandler } from "../utils/async-handler"
import {ApiError} from "../utils/api-error"
import {userTable} from "../models/user.models"


const registerUser = asyncHandler(async (req, res) => {
 
    // getting data from client
    const {email, username, password} = req.body

    // check if user already exists
    const existingUser = await userTable.findOne({
        $or: [{email}, {username}]
    })

    // if user exists, throw error
    if(existingUser){
        throw new ApiError(400, "User with given email or username already exists")
    }

    // create new user
    const newUser = await userTable.create({
        email,
        username,
        password,
        isEmailVerified: false,
    })

    // create temporary token for email verification 
    const {unHashedToken, hashedToken, tokenExpiry} = newUser.generateTemporaryToken()

    newUser.emailVerificationToken = hashedToken
    newUser.emailVerificationTokenExpiry = tokenExpiry
    
    await newUser.save({validateBeforeSave: false})

    // sending Email
    await sendEmail({
        email: newUser.email,
        subject: "Please verify your email",
        mailgenContent: emailVerificationMailgenContent(
            newUser.username,
            `${req.protocol}://${req.get("host")}/api/v1/users/verify-email/${unHashedToken}`
        )
    })

    // excluding fields from database
    const createdUser = await newUser.findById(newUser._id).select("-password -refreshToken -emailVerificationToken -emailVerificationTokenExpiry")

    // if user creation failed
    if(!createdUser){
        throw new ApiError(500, "User registration failed")
    }

    // sending response to client
    return res.status(201).json(
        new ApiResponse(200, {user: createdUser}, "User registered successfully")
    )
    })


export {registerUser}












