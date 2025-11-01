import mongoose from "mongoose";

// Base

const likeSchema = new mongoose.Schema(
  {
    likedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }
  },
  { 
    timestamps: true,
    discriminatorKey: "likeType" 
  }
);

export const Like = mongoose.model("Like", likeSchema);

// video

const videoLikeSchema = new mongoose.Schema({
  video: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video",
      required: true,
    },
  }
) 

videoLikeSchema.index({ likedBy: 1, video: 1 }, { unique: true });
export const VideoLike = Like.discriminator("VideoLike", videoLikeSchema);

// comment

const commentLike = new mongoose.Schema({
  comment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      required: true,
    },
  }
)

commentLike.index({ likedBy: 1, comment: 1 }, { unique: true });
export const CommentLike = Like.discriminator("CommentLike", commentLike);

// flowBoard

const flowboardLike = new mongoose.Schema({
  flow: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FlowBoard",
      required: true,
    },
  }
)

flowboardLike.index({ likedBy: 1, flow: 1 }, { unique: true });
export const FlowBoardLike = Like.discriminator("FlowboardLike", flowboardLike);

// playlist

const playlistLike = new mongoose.Schema({
  playlist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Playlist",
      required: true,
    },
  }
)

playlistLike.index({ likedBy: 1, playlist: 1 }, { unique: true });
export const PlaylistLike = Like.discriminator("PlaylistLike", playlistLike);