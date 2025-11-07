import mongoose from "mongoose";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { 
  VideoLike,
  CommentLike,
  FlowLike,
  PlaylistLike 
} from "../models/like.model.js";


// Toggle like
const toggleLike = asyncHandler(async (req, res, next) => {
  const { asset_type, asset_id } = req.params;
  const user_id = req.user?._id || null;

  if (!user_id) {
    throw new ApiError(401, "Unauthorized. Please login to perform this action.");
  }

  const refMap = {
    video: VideoLike,
    comment: CommentLike,
    flow: FlowLike,
    playlist: PlaylistLike
  };

  if (!refMap[asset_type]) throw new ApiError(400, "Invalid asset type");
  
  const LikeModel = refMap[asset_type];
  const existingLike = await LikeModel.findOne({
    likedBy: user_id,
    [asset_type]: asset_id,
  });

  if (existingLike) {
    await LikeModel.deleteOne({ _id: existingLike._id });
    return res
      .status(200)
      .json(new ApiResponse(200, null, `${asset_type} unliked successfully`));
  }
  
  const newLike = await LikeModel.create({
    likedBy: user_id,
    [asset_type]: asset_id,
  });
  
  return res
  .status(201)
  .json(new ApiResponse(201, newLike, `${asset_type} liked successfully`));

});  

// Get all user likes
const getUserLikes = asyncHandler(async (req, res) => {

    const userId = req.user._id;

    const [videos, comments, flows, playlists] = await Promise.all([
      VideoLike.find({ likedBy: userId }).populate("video"),
      CommentLike.find({ likedBy: userId }).populate("comment"),
      FlowLike.find({ likedBy: userId }).populate("flow"),
      PlaylistLike.find({ likedBy: userId }).populate("playlist"),
    ]);

    if (
      !videos.length &&
      !comments.length &&
      !flows.length &&
      !playlists.length
    ) {
      throw new ApiError(404, "No likes found for this user");
    }


    return res.status(200).json(new ApiResponse(200, { videos, comments, flows, playlists }, "User likes found successfully"));
});

// Get likes for an asset
const getLikesForAsset = asyncHandler(async (req, res) => {
  const { asset_type, asset_id } = req.params;

  const refMap = {
    video: VideoLike,
    comment: CommentLike,
    flow: FlowLike,
    playlist: PlaylistLike,
  };

  if (!refMap[asset_type]) throw new ApiError(400, "Invalid asset type");

  const likes = await refMap[asset_type]
    .find({ [asset_type]: asset_id })
    .populate("likedBy", "username avatar");

  return res
    .status(200)
    .json(new ApiResponse(200, likes, `${asset_type} likes fetched successfully`));
});

// Get like count
const getLikeCount = asyncHandler(async (req, res) => {
  const { asset_type, asset_id } = req.params;

  const refMap = {
    video: VideoLike,
    comment: CommentLike,
    flowboard: FlowBoardLike,
    playlist: PlaylistLike,
  };

  if (!refMap[asset_type]) throw new ApiError(400, "Invalid asset type");

  const count = await refMap[asset_type].countDocuments({ [asset_type]: asset_id });

  return res.status(200).json(
    new ApiResponse(200, { count }, `Total ${asset_type} likes count fetched successfully`)
  );
});

const isAssetLikedByUser = asyncHandler(async (req, res) => {
  const { asset_type, asset_id } = req.params;
  const user_id = req.user._id;

  const refMap = {
    video: VideoLike,
    comment: CommentLike,
    flow: FlowLike,
    playlist: PlaylistLike,
  };

  if (!refMap[asset_type]) throw new ApiError(400, "Invalid asset type");

  const isLiked = await refMap[asset_type].exists({
    likedBy: user_id,
    [asset_type]: asset_id,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, { liked: !!isLiked }, "Like status fetched"));
});

const deleteAllLikesForAsset = async (asset_type, asset_id) => {
  const refMap = {
    video: VideoLike,
    comment: CommentLike,
    flow: FlowLike,
    playlist: PlaylistLike,
  };

  if (refMap[asset_type]) {
    await refMap[asset_type].deleteMany({ [asset_type]: asset_id });
  }
};

export {
  getUserLikes,
  toggleLike,
  getLikesForAsset,
  getLikeCount,
  isAssetLikedByUser,
  deleteAllLikesForAsset
}