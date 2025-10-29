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
app.use(express.static('public')); // it turns your public folder into a lightweight file server
app.use(cookieParser());


// routes import
import userRouter from './routes/user.routes.js'; console.log("user.routes.js loaded");
import tweetRouter from './routes/tweet.routes.js'; console.log("tweet.routes.js loaded");
import videoRouter from './routes/video.routes.js'; console.log("video.routes.js loaded");
import commentRouter from './routes/comment.routes.js'; console.log("comment.routes.js loaded");
import likeRouter from './routes/like.routes.js'; console.log("like.routes.js loaded");
import subscriptionRouter from './routes/subscription.routes.js'; console.log("subscription.routes.js loaded");
import playlistRouter from './routes/playlist.routes.js'; console.log("playlist.routes.js loaded");

// routes declaration
app.use("/api/v1/users", userRouter); // http://localhost:8000/api/v1/users/register
app.use("/api/v1/tweets", tweetRouter); // http://localhost:8000/api/v1/tweets
app.use("/api/v1/videos", videoRouter); // http://localhost:8000/api/v1/videos
app.use("/api/v1/comments", commentRouter); // http://localhost:8000/api/v1/comments
app.use("/api/v1/likes", likeRouter); // http://localhost:8000/api/v1/likes
app.use("/api/v1/subscriptions", subscriptionRouter); // http://localhost:8000/api/v1/subscriptions
app.use("/api/v1/playlists", playlistRouter); // http://localhost:8000/api/v1/playlists


export default app