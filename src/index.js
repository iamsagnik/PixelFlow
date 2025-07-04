// require('dotenv').config({path: './.env'});

import dotenv from "dotenv";
import connectDB from './db/index.js';
import app from "./app.js";

dotenv.config({
  path: './.env'
});
// import express from "express";
// const app = express();

connectDB()
.then(() => {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Listening on port ${port}`);
  });
})
.catch((err) => {
  console.error(err);
  process.exit(1);
});




/* 
const app = express();

;( async () => {
  try{
    await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
    app.on("error", (error) => {
      console.error(error);
      throw error;
    });

    app.listen(process.env.PORT, () => {
      console.log(`Listening on port ${process.env.PORT}`);
    });
  }
  catch(error){
    console.error("Error while connecting to DB", error);
    throw error;
  }
})()
 */