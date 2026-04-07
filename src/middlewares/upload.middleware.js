import dotenv from "dotenv"
import multer from "multer"
import multerS3 from "multer-s3"
import s3_Client from "../config/s3.js"

dotenv.config()

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
    fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024, //50Mb
        files: 10 // max 10 files
    }
})