import express from "express"
import cors from "cors"

const app = express()

// ------------------------ Middleware
app.use(express.json({limit: "16kb"})) // to make readable clients json.body
app.use(express.urlencoded({extended: true, limit: "16kb"})) // this will encode your url for safety reason  
app.use(express.static("public")) // this tells express about never changing files/data

// ------------------------ CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || "*",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}))

// ------------------------ API
app.get("/", (req, res)=>{
  res.end("hello taha")
})


export default app