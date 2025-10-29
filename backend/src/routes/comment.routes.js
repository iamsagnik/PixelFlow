import {Router} from "express";
import { getAllCommentsOfVideo, doComment, deleteMyComment, updateComment } from "../controllers/comment.controller.js";
import {verifyJWT} from "../middlewares/auth.middleware.js";


const router = Router();

router.use(verifyJWT);

router
.route("/:video_id")
.get(getAllCommentsOfVideo)  // GET .../comments/:video_id?page=x&limit=y
.post(doComment);

router
.route("/:video_id/:comment_id")
.delete(deleteMyComment)
.patch(updateComment);

export default router;