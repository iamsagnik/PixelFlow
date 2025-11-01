import { Router } from "express";
import {
  getUserLikes,
  toggleLike,
  getLikesForAsset,
  getLikeCount,
  isAssetLikedByUser
} from "../controllers/like.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(verifyJWT);

router
.route("/:asset_type/:asset_id")
.post(toggleLike)

router
.route("/")
.get(getUserLikes);

router
.route("/:asset_type/:asset_id/all")
.get(getLikesForAsset);

router
.route("/:asset_type/:asset_id/count")
.get(getLikeCount);

router
.route("/:asset_type/:asset_id/status")
.get(isAssetLikedByUser);



export default router;