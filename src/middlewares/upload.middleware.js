import dotenv from "dotenv"
import multer from "multer"
import multerS3 from "multer-s3"
import s3_Client from "../config/s3.js"

dotenv.config()

const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/zip"
]




export const uploadAvatar = multer({
    storage: multerS3({
        s3: s3_Client,
        bucket: process.env.AWS_S3_BUCKET_NAME,
        contentType: multerS3.AUTO_CONTENT_TYPE,
        key: (req, file, cb)=>{
            const taskId = req.param.taskId || "new"
            const timestamp = Date.now()
            const filename = `task-${taskId}/${timestamp}-${file.originalname}`
            cb(null, filename)
        }
    }),
    
    fileFilter: (req, file, cb)=>{
        // only avatar image is allow
        const imageTypes = ["image/jpeg", "image/png", "image/gif"]
        if(imageTypes.includes(file.mimetype)){
            cb(null, true)
        }else{
            cb(new Error("only image are allowed for avatar", false))
        }
    },


    limits: {
        fileSize: 50 * 1024 * 1024, //50Mb
        files: 10 // max 10 files
    }
})





export const uploadTaskAttachments = multer({
    storage: multerS3({
        s3: s3_Client,
        bucket: process.env.AWS_S3_BUCKET_NAME,
        contentType: multerS3.AUTO_CONTENT_TYPE,
        key: (req, file, cb)=>{
            const taskId = req.param.taskId || "new"
            const timestamp = Date.now()
            const filename = `task-${taskId}/${timestamp}-${file.originalname}`
            cb(null, filename)
        } 
    }),
    fileFilter: (req, file, cb)=>{
        if(allowedMimeTypes.includes(file.mimetype)){
            cb(null, true)
        }else{
            cb(new Error("File type not allowed", false))
        }
    },
})