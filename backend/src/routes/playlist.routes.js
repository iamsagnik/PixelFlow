import { Router } from "express";
import {
  createPlaylist,
  deletePlaylist,
  renamePlaylist,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  getAllPlaylistsOfUser
} from "../controllers/playlist.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";


const router = Router();

router.use(verifyJWT);

router
.route("/")
.post(createPlaylist)

router
.route("/:playlist_id")
.delete(deletePlaylist)
.patch(renamePlaylist)

router
.route("/:playlist_id/video/:video_id")
.post(addVideoToPlaylist)
.delete(removeVideoFromPlaylist);

router
.route("/user/:user_id")  // /playlist/user/:user_id?page=x&limit=y
.get(getAllPlaylistsOfUser);

export default router;