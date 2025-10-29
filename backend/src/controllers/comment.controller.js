import {asyncHandler} from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { Comment } from "../models/comment.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";


// show all comments of a video
const getAllCommentsOfVideo = asyncHandler(async (req, res) => {

  // thing to remember : req will have user
  // we need video id : which we get from params
  // comment got two fields : id and video_id
  // now we want to send comment content and user name and user avatar in response
  // pipeline starts :
  // we match video id with comment video id  : we get specific comments of the video
  // currently there is no change in the fields
  // now we lookup with users collection to get user details but we only need user name and avatar
  // now we can send the response
  // later i came to know about pagination so now i am also going to send page and limit as query

  const {video_id} = req.params;
  const page = Math.max(1,parseInt(req.query.page) || 1);
  const limit = Math.min(30, parseInt(req.query.limit) || 10);

  if (!mongoose.Types.ObjectId.isValid(video_id)) {
    throw new ApiError(400, "Invalid video ID");
  }


  const pipeline = [
    {
      $match: {
        video: new mongoose.Types.ObjectId(video_id)
      }
    },
    {
      $sort: {
        createdAt: -1,
      }
    },
    {
      $lookup: {
        from: "users",
        let: {  owner_id: "$owner" },
        pipeline: [
            {
              $match : {
                $expr : {
                  $eq : ["$_id", "$$owner_id"]
                }
              }
            },
            {
              $project : {
                username: 1,
                avatar: 1,
                fullName: 1,
                _id: 0
              }
            }
        ],
        as: "user_details",
      }
    },
    {
      $unwind: "$user_details",
    },
    {
      $addFields: {
        username: "$user_details.username",
        avatar: "$user_details.avatar",
        fullName: "$user_details.fullName"
      }
    },
    {
      $project: {
        username: 1,
        avatar: 1,
        fullName: 1,
        content: 1,
        owner: 1,
        video: 1,
        createdAt: 1,
      }
    }
  ]
  
  const options = {
    page,
    limit,
  };

  const comments = await Comment.aggregatePaginate(Comment.aggregate(pipeline), options).catch((err) => {
    throw new ApiError(500, err.message);
  });

  return res
  .status(200)
  .json(new ApiResponse(200, comments, "Comments fetched successfully"));
})


// do a comment in a video
const doComment = asyncHandler(async (req, res) => {
  
  // i will fetch video id from params
  // i will take comment content from req body
  // i will fetch user id from req.user
  // no one should post blank comment
  // i will create a comment object
  // put the necessary fields
  // i will save the comment
  // i will send the response

  const {video_id} = req.params;
  const {content} = req.body;
  const user_id = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(video_id)) {
    throw new ApiError(400, "Invalid video ID");
  }

  if (!content?.trim()) throw new ApiError(400, "Comment content is required");

  const comment = await Comment.create({
    content,
    owner: user_id,
    video: video_id
  });

  if (!comment) {
    throw new ApiError(500, "Failed to create comment");
  }

  console.log(comment);

  const createdComment = await Comment.findById(comment._id).populate("owner", "username avatar fullName").catch((err) => {
    throw new ApiError(500, err.message);
  })

  return res
  .status(200)
  .json(new ApiResponse(200, createdComment, "Comment created successfully"));

})


// delete my own comment from a video
const deleteMyComment = asyncHandler(async (req, res) => {

  // when i am writing this comments i am thinking of a separate dashboard which will have all my comments to see
  // so i will have a delete button which will delete the comments
  // there will be individual comments with a delete button beside them 
  // i will fetch comment id from req and also user id for authentication check 
  // i will check if the comment id is valid
  // i will delete the comment
  // i will send the response
  //  ** i forget about to check if the user is the owner of the comment or not so authentication will be required
  // apparantly i also forgot the situation of deleting already deleted comments
  
  const { comment_id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(comment_id)) {
    throw new ApiError(400, "Invalid comment ID");
  }

  const comment = await Comment.findById(comment_id);

  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  const commentOriginalOwner = comment.owner;
  const currentUser = req.user._id;

  if (!commentOriginalOwner.equals(currentUser)) {
    // !== will not work because they are strings
    throw new ApiError(403, "Unauthorized to delete this comment");
  }

  const deletedComment = await Comment.findByIdAndDelete(comment_id);

  if(!deletedComment) {
    throw new ApiError(404, "Comment not found");
  }

  return res
  .status(200)
  .json(new ApiResponse(200, deletedComment, "Comment deleted successfully"));

})


// update a cmmnt
const updateComment = asyncHandler(async (req, res) => {
  
  // i will fetch comment id from params
  // i will take the new comment content from req body 
  // i will fetch user id from req.user (added by VerifyJWT middleware)
  // i will check if the comment id is valid
  // (gpt) i will check if it even exists in db
  // then i will check if the user is the owner of the comment
  // i will update the comment
  // i will send the updated object in response
  // things i did wrong : did not check if it is same comment or not and if it is just ""

  const {comment_id} = req.params;
  const newComment = req.body.content;
  const currentUser = req.user._id;

  if(!mongoose.Types.ObjectId.isValid(comment_id)){
    throw new ApiError(400, "Invalid comment ID");
  }

  if(!newComment?.trim()){
    throw new ApiError(400, "Comment content is required");
  }

  const comment = await Comment.findById(comment_id);

  if(!comment) {
    throw new ApiError(404, "Comment not found");
  }

  const commentOriginalOwner = comment.owner;

  if(!commentOriginalOwner.equals(currentUser)){
    throw new ApiError(403, "Unauthorized to update this comment");
  }

  if(comment.content === newComment){
    throw new ApiError(400, "Comment content is same as before");
  }
  
  const updatedComment = await Comment.findByIdAndUpdate(
    comment_id,
    {
      $set: {
        content: newComment,
      }
    },
    {new: true}  // retunns the updated object instead of the old one
  )

  return res
  .status(200)
  .json(new ApiResponse(200, updatedComment, "Comment updated successfully"));

})


export {
  getAllCommentsOfVideo,
  doComment,
  deleteMyComment,
  updateComment
}