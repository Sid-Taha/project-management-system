// src\index.js
import dotenv from "dotenv";
import app from "./app.js"
import connectMongoDb from "./db/connection.js"

dotenv.config({
  path: "./.env",
});

const port = process.env.PORT || 8000


connectMongoDb(process.env.MONGODB_URL)

.then(app.listen(port, ()=>{console.log(`✅ Server is up and running on port ${port}`)}))

.catch(()=>{
  console.log("❌ Failed to connect to MongoDB. Exiting...");
  process.exit(1);
})



