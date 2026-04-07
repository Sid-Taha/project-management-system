import dotenv from "dotenv"
import { S3Client, ListBucketsCommand } from "@aws-sdk/client-s3";

dotenv.config()

const s3_Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }    
})

export default s3_Client