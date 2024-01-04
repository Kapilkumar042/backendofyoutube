// require('dotenv').config({path:'./env'})
import dotenv from "dotenv"
import connectDB from "./db/index.js"
dotenv.config({path:"./env"})
import express from "express";
const app=express();

connectDB()




// import mongoose from "mongoose";
// import {DB_NAME} from "./constants.js";
// (async()=>{
// try {
//     await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
//     app.on("error",(error)=>{
//         console.log("error", error);
//         throw err
//     })

//     app.listen(process.env.PORT,()=>{
//         console.log(`App is listening on port ${process.env.PORT}`);
//     })
// } catch (error) {
//     console.error("ERROR",error);
//     throw err
// }
// })()