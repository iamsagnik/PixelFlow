import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import {
  uploadVideo,
  updateVideo,
  deleteVideo,
  searchVideo,
  getAllVideosOfUser,
  getVideoById,
  getAllPublishedVideos,
  toggleVideoStatus
}  from "../controllers/video.controller.js";
import { upload } from "../middlewares/multer.middleware.js";


const router = Router();

router
.route("/")
.get(verifyJWT, getAllPublishedVideos)
.post(
  verifyJWT,
  upload.fields([
    { 
      name: "thumbnail",   // the frontend field will also have to be named "thumbnail"
      maxCount: 1
    },
    {
      name: "videoFile",
      maxCount: 1
    }
  ]),
  uploadVideo);

router
.route("/search")
.get(searchVideo);  //  /search?q=query&page=x&limit=y

router
.route("/user/:user_id")         //  /user/:user_id/page=x&limit=y
.get(verifyJWT,getAllVideosOfUser);

router
.route("/:video_id")
.get(getVideoById)
.delete(verifyJWT, deleteVideo)
.patch(
  verifyJWT,
  upload.single("thumbnail"),
  updateVideo);

router
.route("/toggle/:video_id")
.patch(verifyJWT, toggleVideoStatus);


export default router