import { ApiResponse } from "../utils/api-response.js"
import { asyncHandler } from "../utils/async-handler.js"
import {ApiError} from "../utils/api-error.js"
import {userTable} from "../models/user.models.js"
import {sendEmail, emailVerificationMailgenContent} from "../utils/mail.js"


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

    // create temporary token for email verification for 20 mints
    const {unHashedToken, hashedToken, tokenExpiry} = newUser.generateTemporaryToken()

    newUser.emailVerificationToken = hashedToken // save hashed token in database
    newUser.emailVerificationTokenExpiry = tokenExpiry // 20 minutes from now
    
    await newUser.save({validateBeforeSave: false}) // saving user without running validation again

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
    const createdUser = await userTable.findById(newUser._id).select("-password -refreshToken -emailVerificationToken -emailVerificationTokenExpiry")

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












