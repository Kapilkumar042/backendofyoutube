// require('dotenv').config({path:'./env'})
import dotenv from "dotenv";
import connectDB from "./db/index.js";
dotenv.config({ path: "./env" });
import {app} from "./app.js"
const port = process.env.PORT || 8000;
connectDB()
  .then(() => {
    app.on("error", (error) => {
      console.log("app have some error to running", error);
    });
    app.listen(port, () => {
      console.log(`app started on port ${port}`);
    });
  })
  .catch((err) => {
    console.log("mongodb connection failed", err);
  });

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
