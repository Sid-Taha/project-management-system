// src\config\passport.js
import dotenv from "dotenv";
import {Strategy as GoogleStrategy}  from "passport-google-oauth20"
import passport from "passport"
import {userTable} from "../models/user.models.js"
import crypto from "crypto"

dotenv.config()

passport.use(
    new GoogleStrategy(
    // 1st parameter google console credentials
    {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL
    },
    
    // 2nd parameter the function which you want to run after "OAuth consent screen"
    async (accessToken, refreshToken, profile, done) => {
        try {
            // check if user already exists in database
            let user = await userTable.findOne({ googleId: profile.id })

            // if user exists, return user
            if(user) return done(null, user)
        
            // check if user is exist with same email (registered manually before)
            user = await userTable.findOne({email: profile.emails[0].value})

            if(user){
                user.googleId = profile.id
                user.isEmailVerified = true
                if(!user.avatar){
                    user.avatar = profile.photos[0]?.value || null
                }
                await user.save({validateBeforeSave: false})

                return done(null, user)
            }

            // new user create in DB
            const newUser = await userTable.create({
                googleId: profile.id,
                email: profile.emails[0].value,
                username: profile.emails[0].value.split("@")[0],
                fullName: profile.displayName,
                avatar: profile.photos[0]?.value || null,
                isEmailVerified: true,
                password: crypto.randomUUID()
            })

            return done(null, newUser)

        } catch (error) {
            return done(error, null)
        }

    }
))


export default passport