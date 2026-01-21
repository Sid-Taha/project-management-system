import { ApiResponse } from "../utils/api-response.js"
import { asyncHandler } from "../utils/async-handler.js"
import {ApiError} from "../utils/api-error.js"
import {userTable} from "../models/user.models.js"
import {sendEmail, emailVerificationMailgenContent} from "../utils/mail.js"
import crypto from "crypto"


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




const login = asyncHandler(async (req, res) => {
    // getting data from client
    const {email, password} = req.body

    // check if email exists
    if(!email){
        throw new ApiError(400, "Email is required")
    }

    // check if user exists in database
    const existingUser = await userTable.findOne({email})

    // if user does not exist, throw error
    if(!existingUser){
        throw new ApiError(404, "User with given email does not exist")
    }

    // check if password is correct
    const isPasswordCorrect = await existingUser.isPasswordCorrect(password)

    // if password is incorrect, throw error
    if(!isPasswordCorrect){
        throw new ApiError(401, "Incorrect password")
    }
    
    // generate access token and refresh token
    const accessToken = existingUser.generateAccessToken()
    const refreshToken = existingUser.generateRefreshToken()

    // setting cookies options
    const options = {
        httpOnly: true,
        secure: true
    }

    // returning response to client with user details and tokens
    return res
    .status(200)
    .cookie("refreshToken", refreshToken, options)
    .cookie("accessToken", accessToken, options)
    .json(
        new ApiResponse(
            200,
            
            {user: {
                _id: existingUser._id,
                email: existingUser.email,
            }, 
            accessToken, 
            refreshToken
            },

            "User logged in successfully"
    ))


})

const verifyEmail = asyncHandler(async (req, res) => {
    // getting verification token from params/url
    const {verificationToken} =  req.params

    // if token is not present, throw error
    if(!verificationToken){
        throw new ApiError(400, "Verification token is missing")
    }

    // hash the received token to compare with database
    const hashedToken = crypto
        .createHash('sha256')
        .update(verificationToken)
        .digest('hex');

    // find user with the hashed token and check if token is not expired
    const user = await userTable.findOne({
        emailVerificationToken: hashedToken,
        emailVerificationTokenExpiry: {$gt: Date.now()}
    })

    // if user not found, throw error
    if(!user){
        throw new ApiError(400, "Invalid or expired verification token")
    }

    // update user's email verification status
    user.isEmailVerified = true
    user.emailVerificationToken = undefined
    user.emailVerificationTokenExpiry = undefined
    // save the updated user
    await user.save({validateBeforeSave: false})

    // send response to client
    return res.status(200).json(
        new ApiResponse(200, null, "Email verified successfully")
    )
});



export {registerUser, login, verifyEmail}












