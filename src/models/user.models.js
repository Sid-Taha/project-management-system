import mongoose, {Schema} from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const userSchema = new Schema({
    avatar: {
        type: {
            url : String,
        },
        default: {
            url : "https://placehold.co/200x200",
        }
    },
    username: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    fullName: {
        type: String,
        trim: true,
    },
    password: {
        type: String,
        required: [true, "Password is required"],
    },
    isEmailVerified: {
        type: Boolean,
        default: false,
    },
    refreshToken: {
        type: String,
    },
    forgotPasswordToken: {
        type: String,
    },
    forgotPasswordTokenExpiry: {
        type: Date,
    },
    emailVerificationToken: {
        type: String,
    },
    emailVerificationTokenExpiry: {
        type: Date,
    }
}, {timestamps: true})



// -------------------------------- Pre Hooks -------------------------------- //
userSchema.pre("save", async function(next){
    if(!this.isModified("password")){
        // if password is not modified, move to the next middleware
        return next()
    }else{
        // hash the password
        await bcrypt.hash(this.password, 10)
        next()
    } 
})



// -------------------------------- Methods -------------------------------- //
//------------------------------- Compare Password
userSchema.methods.isPasswordCorrect = async function (password){
    return await bcrypt.compare(password, this.password)
}


//------------------------------- Generate JWT Access Token
userSchema.methods.generateAccessToken = function (){
    
    const payload = {
        _id: this._id,
        email: this.email,
        username: this.username,
    }

    return jwt.sign( 
        payload, 
        process.env.ACCESS_TOKEN_SECRET, 
        {expiresIn: process.env.ACCESS_TOKEN_EXPIRY}
    )
}


// ------------------------------- Generate JWT Refresh Token
userSchema.methods.generateRefreshToken = function (){
    const payload = {
        _id: this._id,
    }
    
    return jwt.sign( 
        payload, 
        process.env.REFRESH_TOKEN_SECRET, 
        {expiresIn: process.env.REFRESH_TOKEN_EXPIRY}
    )
}


// ------------------------------- temporary tokens for email verification and password reset
userSchema.methods.generateTemporaryToken = function (){
    const unHashedToken = crypto.randomBytes(20).toString('hex');

    const hashedToken = crypto
        .createHash('sha256')
        .update(unHashedToken)
        .digest('hex');

    const tokenExpiry = Date.now() + 20 * 60 * 1000; // 20 minutes from now

    return {unHashedToken, hashedToken, tokenExpiry};
}





const userTable = mongoose.model("User", userSchema);

export {userTable}