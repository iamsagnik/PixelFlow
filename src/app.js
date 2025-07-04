import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser'; 


const app = express();
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true,
}));

app.use(express.json({limit: '1mb'}));
app.use(
  express.urlencoded({limit: '1mb', extended: true})
);
app.use(express.static('public')); 
app.use(cookieParser());


// routes import
import userRouter from './routes/user.routes.js';
console.log("user.routes.js loaded");

// routes declaration
app.use("/api/v1/users", userRouter);
// http://localhost:8000/api/v1/users/register


export default app