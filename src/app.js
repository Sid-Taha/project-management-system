// src\app.js
import express from "express"
import cors from "cors"
import healthCheckRoutes from "./routes/healthCheck.routes.js"
import authRouter from "./routes/auth.routes.js"
import projectRouter from "./routes/projects.routes.js"
import cookieParser from "cookie-parser";

const app = express()

// ------------------------ Cookie Parser
app.use(cookieParser());

// ------------------------ Middleware
app.use(express.json({limit: "16kb"})) // to make readable clients json.body
app.use(express.urlencoded({extended: true, limit: "16kb"})) // this will encode your url for safety reason  
app.use(express.static("public")) // this tells express about never changing files/data

// ------------------------ CORS
app.use(cors({
  // origin: process.env.CORS_ORIGIN || "*",
  origin: "http://localhost:3000",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}))

// ------------------------ API
app.get("/", (req, res)=>{
  res.end("Welcome to Project management API")
})

// ------------------------ API Routes
app.use("/api/v1/health-check", healthCheckRoutes)
app.use("/api/v1/auth", authRouter)
app.use("/api/v1/project", projectRouter)

export default app