import { ApiResponse } from "../utils/api-response.js"
import { asyncHandler } from "../utils/async-handler.js"
import {ApiError} from "../utils/api-error.js"
import {userTable} from "../models/user.models.js"
import {sendEmail, emailVerificationMailgenContent} from "../utils/mail.js"
import crypto from "crypto"
import jwt from "jsonwebtoken"


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
            `${req.protocol}://${req.get("host")}/api/v1/auth/verify-email/${unHashedToken}`
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
    console.log("🚀 ~ email:", email)
    console.log("🚀 ~ password:", password)

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

    // save refresh token in database
    existingUser.refreshToken = refreshToken
    await existingUser.save({validateBeforeSave: false})

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




const logoutUser = asyncHandler(async (req, res) => {
    // clear refresh token from database
    await userTable.findByIdAndUpdate(
    req.user._id, 
    {
        $set: {refreshToken: ""}
    },
    {
        new: true,
    })

    // option to clear cookies
    const options = {
        httpOnly: true,
        secure: true,
    }

    // send response to client
    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
        new ApiResponse(200, null, "User logged out successfully")
    )
});




const resendEmailVerification = asyncHandler(async (req, res) => {
    // getting user from req.body
    const {email} = req.body

    // find user from database with the help of email
    const user = await userTable.findOne({email})

    // if user not found, throw error
    if(!user){
        throw new ApiError(404, "User not found")
    }

    // if email is already verified, throw error
    if(user.isEmailVerified){
        throw new ApiError(400, "Email is already verified")
    }

    // create temporary token for email verification for 20 mints
    const {unHashedToken, hashedToken, tokenExpiry} = user.generateTemporaryToken()

    user.emailVerificationToken = hashedToken // save hashed token in database
    user.emailVerificationTokenExpiry = tokenExpiry // 20 minutes from now

    await user.save({validateBeforeSave: false}) // saving user without running validation again

    // sending Email
    await sendEmail({
        email: user.email,
        subject: "Please verify your email",
        mailgenContent: emailVerificationMailgenContent(
            user.username,
            `${req.protocol}://${req.get("host")}/api/v1/auth/verify-email/${unHashedToken}`
        )
    })

    // send response to client
    return res.status(200).json(
        new ApiResponse(200, null, "Verification email resent successfully, please check your inbox")
    )
});




const getCurrentUser = asyncHandler(async (req, res) => {
    // send response to client with current logged in user details from req.user set in verifyJWT middleware
    return res.status(200).json(
        new ApiResponse(200, {user: req.user}, "Current user fetched successfully")
    )
});


const refreshAccessToken = asyncHandler(async (req, res) => {
    // get refresh token from cookies
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    // if refresh token is not present, throw error
    if(!incomingRefreshToken){
        throw new ApiError(400, "Refresh token is missing")
    }

    try {
        // verify the incoming refresh token from client to get _id
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
        console.log("🚀 ~ decodedToken:", decodedToken)

        // find user from database
        const user = await userTable.findById(decodedToken._id)
        console.log("🚀 ~ user:", user)

        // if user not found, throw error
        if(!user){
            throw new ApiError(404, "User not found")
        }
        
        // check if the incoming refresh token of client matches the one in database
        if(user.refreshToken !== incomingRefreshToken){
            throw new ApiError(401, "Invalid refresh token")
        }

        // generate new access token
        const newAccessToken = user.generateAccessToken()
        console.log("🚀 ~ newAccessToken:", newAccessToken)

        // setting cookies options
        const options = {
            httpOnly: true,
            secure: true
        }

        // send response to client with new access token
        return res
        .status(200)
        .cookie("accessToken", newAccessToken, options) 
        .json(
            new ApiResponse(200, {accessToken: newAccessToken}, "Access token refreshed successfully")
        )


    } catch (error) {
        throw new ApiError(401, "Invalid or expired refresh token")
    }
});




const forgetPasswordRequest = asyncHandler(async (req, res) => {
    // getting email from req.body
    const {email} = req.body

    // find user from database with the help of email
    const user = await userTable.findOne({email})

    // if user not found, throw error
    if(!user){
        throw new ApiError(404, "User not found")
    }

    // create temporary token for email verification for 20 mints
    const {unHashedToken, hashedToken, tokenExpiry} = user.generateTemporaryToken()

    user.emailVerificationToken = hashedToken // save hashed token in database
    user.emailVerificationTokenExpiry = tokenExpiry // 20 minutes from now
    await user.save({validateBeforeSave: false}) // saving user without running validation again

    // sending Email
    await sendEmail({
        email: user.email,
        subject: "Please verify your email",
        mailgenContent: emailVerificationMailgenContent(
            user.username,
            `${req.protocol}://${req.get("host")}/api/v1/auth/reset-password/${unHashedToken}`
        )
    })

    // send response to client
    return res.status(200).json(
        new ApiResponse(200, null, "Password reset email sent successfully, please check your inbox")
    )
});



const resetForgotPassword = asyncHandler(async (req, res) => {
    // getting reset token from params/url
    console.log("✅");
    
    const {resetToken} =  req.params // resetToken = unHashedToken

    const newPassword = "thisIsNewPassword123" // req.body

    // if token is not present, throw error
    if(!resetToken){
        throw new ApiError(400, "Reset token is missing")
    }

    // hash the received token to compare with database
    const hashedToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    // find user with the hashed token and check if token is not expired
    const user = await userTable.findOne({
        emailVerificationToken: hashedToken,
        emailVerificationTokenExpiry: {$gt: Date.now()}
    })

    // if user not found, throw error
    if(!user){
        throw new ApiError(400, "Invalid or expired reset token")
    }

    // update user's password
    user.password = newPassword // set new password
    user.emailVerificationToken = undefined
    user.emailVerificationTokenExpiry = undefined // 20 minutes time
    await user.save({validateBeforeSave: false})

    // send response to client
    return res.status(200).json(
        new ApiResponse(200, null, "Password reset successfully")
    )
});



export {registerUser, login, verifyEmail, logoutUser, resendEmailVerification, getCurrentUser, refreshAccessToken, forgetPasswordRequest, resetForgotPassword}












