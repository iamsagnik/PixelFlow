import {asyncHandler} from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import assetUploadOnCloudinary from "../utils/assetUploadOnCloudinary.js";
import assetDeletionOnCloudinary from "../utils/assetDeletionOnCloudinary.js";
import { 
  modifiedTextArray,
  removeStopWords,
  getSynonyms,
  getSingularForm,
  deleteDuplicates
 } from "../utils/textModify.js";


// upload a video
const uploadVideo = asyncHandler(async (req, res) => {
  
  // we get title, description from req.body
  // we get videoFile and thumbnail from req.file
  // all of these fields are mandatory
  // we get user_id from req.user
  // we check if user_id is valid
  // we check if user exists
  // we upload videoFile and thumbnail on cloudinary
  // we get url of videoFile and thumbnail and duration of videoFile from cloudinary
  // we create video object
  // we send response
  // **forgot to validate title, description and error handling for cloudinary operations
  // **we also take isPublic from req.body 

  console.log("Video upload controller called");

  const {title, description, isPublic} = req.body;

  if(!title || !description) throw new ApiError(400, "Title and description both are required");

  if(!req.files?.videoFile || !req.files?.thumbnail)throw new ApiError(400, "Video file and thumbnail both are required");

  const user_id = req.user._id;

  if(!mongoose.Types.ObjectId.isValid(user_id)){
    throw new ApiError(400, "Invalid user ID");
  }

  const userFound = await User.findById(user_id);

  if(!userFound){
    throw new ApiError(404, "User not found");
  }

  const videoFileLocalPath = req.files?.videoFile[0]?.path;

  if(!videoFileLocalPath){
    throw new ApiError(400, "Video file is required");
  }

  const thumbnailLocalPath = req.files?.thumbnail[0]?.path;

  if(!thumbnailLocalPath){
    throw new ApiError(400, "Thumbnail is required");
  }

  const videoFileUrl = await assetUploadOnCloudinary(videoFileLocalPath);
  const thumbnailUrl = await assetUploadOnCloudinary(thumbnailLocalPath);

  if(!videoFileUrl) throw new ApiError(500, "Error uploading video file");
  if(!thumbnailUrl) throw new ApiError(500, "Error uploading thumbnail");

  console.log(videoFileUrl);

  const duration = videoFileUrl.duration || 0;

  const isPublicBool = isPublic === "true" || isPublic === true;

  const video = await Video.create({
    owner :user_id,
    title,
    description,
    videoFile: {
      url: videoFileUrl.url,
      public_id: videoFileUrl.public_id,
    },
    thumbnail: {
      url: thumbnailUrl.url,
      public_id: thumbnailUrl.public_id,
    },
    duration,
    isPublic : isPublicBool
  });

  res
  .status(201)
  .json(new ApiResponse(201, video, "Video uploaded successfully"));

});


// update a video title, description, thumbnail
const updateVideo = asyncHandler(async (req, res) => {

  // we get video_id from req.params
  // we get title, description from req.body
  // we get thumbnail from req.files
  // we check if video_id is valid (as in if it is really a valid mongoDB 24hex _id)
  // we check if video exists
  // we check if user is owner of video
  // we get previous thumbnail url from cloudinary
  // we upload new thumbnail on cloudinary and get url
  // we delete previous thumbnail url from cloudinary
  // we update video title, description and thumbnail
  // we send response
  // **added public/private toggle

  const {video_id} = req.params;

  if(!mongoose.Types.ObjectId.isValid(video_id)){
    throw new ApiError(400, "Invalid video ID");
  }

  const videoFound = await Video.findById(video_id);

  if(!videoFound) throw new ApiError(404, "Video not found");

  const {title, description, isPublic} = req.body;
  
  const newTitle = title ? title.trim() : videoFound.title;
  const newDescription = description ? description.trim() : videoFound.description;
  const newIsPublic = 
  typeof isPublic === "string" ? isPublic === "true" : isPublic ?? videoFound.isPublic;

  const thumbnailLocalPath = req.files?.thumbnail[0]?.path;

  const newThumbnail = (thumbnailLocalPath)? await assetUploadOnCloudinary(thumbnailLocalPath): videoFound.thumbnail;

  if(thumbnailLocalPath && !newThumbnail){
    throw new ApiError(500, "Error uploading thumbnail");
  }

  const user_id = req.user._id;

  if(!videoFound.owner.equals(user_id)){
    throw new ApiError(403, "You are not authorized to update this video");
  }

  const previousThumbnailId = videoFound.thumbnail.public_id;

  videoFound.title = newTitle;
  videoFound.description = newDescription;
  videoFound.thumbnail = { url: newThumbnail.url, public_id: newThumbnail.public_id };
  videoFound.isPublic = newIsPublic;

  const video = await videoFound.save();

  if(!video) throw new ApiError(500, "Error updating video");

  if(previousThumbnailId && thumbnailLocalPath){
    await assetDeletionOnCloudinary(previousThumbnailId);
  }

  res
  .status(200)
  .json(new ApiResponse(200, video, "Video updated successfully"));
  
});


// delete a video
const deleteVideo = asyncHandler(async (req, res) => {

  // get vid id from req.params
  // check if vid id is valid
  // check if video exists
  // get user id from req.user
  // check if user is owner of video
  // delete video from cloudinary
  // delete video from db
  // send response

  const {video_id} = req.params;

  if(!mongoose.Types.ObjectId.isValid(video_id)){
    throw new ApiError(400, "Invalid video ID");
  }

  const videoFound = await Video.findById(video_id);

  if(!videoFound) throw new ApiError(404, "Video not found");

  const user_id = req.user._id;

  if(!videoFound.owner.equals(user_id)){
    throw new ApiError(403, "You are not authorized to delete this video");
  }

  const deletedVideoFile = await assetDeletionOnCloudinary(videoFound.videoFile.public_id);
  const deletedThumbnail = await assetDeletionOnCloudinary(videoFound.thumbnail.public_id);

  if(!deletedVideoFile){
    throw new ApiError(500, "Error deleting video file from cloudinary");
  }

  if(!deletedThumbnail){
    throw new ApiError(500, "Error deleting thumbnail from cloudinary");
  }

  const deletedVideo = await Video.findByIdAndDelete(video_id);

  if(!deletedVideo) throw new ApiError(500, "Error deleting video");

  res
  .status(200)
  .json(new ApiResponse(200, deletedVideo, "Video deleted successfully"));
  
});


// search a video by title
const searchVideo = asyncHandler(async (req, res) => {
  
  // we get query from req.query (search box)
  // we get page and limit from req.query
  // we check if query is empty or not
  // we trim the query
  // we make the query and tags case insensitive 
  // we make it an array of words
  // we modify the array to remove stop words
  // we filter the videos based on this array
  // for this we introduce a new field in video schema called tags
  // which is an array of strings and we make this internally from the title and description
  // for both arrays it the comparing will work like this :
  // as both are case insensitive, it will be easier
  // we use pluralize package to get the singular form of the word
  // we use synonyms package to get the synonyms of the word
  // we use similar words package to get the similar words of the word
  // we apply pagination
  // we get videos from db
  // we show it first based on privacy, score[written below], then created at
  // we can also make a system where each video has a score based on, score = (matchedWords * log(views) + 2 * engagement_rate + subscribed_to [value can be either 0 or 1] )/{(currTime - createdAt) + e}
  // here engagement_rate is calculated from views, likes and comments in that video
  // engagement_rate = (No. of likes * 0.5 + No. of comments * 0.3 + No. of views * 0.2)
  // e is a constant to not get extreme values, let it be 10
  // all time will be in hours
  // we send response
  // **forgot to update tags in case of title/description change
  // (gpt) we need to take max 3 synonyms and 3 similar words for each word otherwise search space will increase too much
  // lol end

  const query = req.query.q;
  const page = Math.max(1,parseInt(req.query.page) || 1);
  const limit = Math.min(30, parseInt(req.query.limit) || 10);

  const user_id = req.user?._id || null;
  let channelIds = [];
  if (user_id) {
    const subs = await Subscription.find({ subscriber: user_id })
      .select("channel");
    channelIds = subs.map(s => s.channel);
  }

  if(!query) throw new ApiError(400, "Query is required");

  let queryArray = modifiedTextArray(query);
  queryArray = removeStopWords(queryArray);
  queryArray = getSynonyms(queryArray);
  queryArray = getSingularForm(queryArray);
  queryArray = deleteDuplicates(queryArray);

  const currTime = Date.now();

  const pipeline = [
    {
      $match: {
        isPublic: true,
        tags: { $in: queryArray },
      },
    },
    //  Lookup for number of comments
    {
      $lookup: {
        from: "comments",
        localField: "_id",
        foreignField: "video",
        as: "comments",
      },
    },
    {
      $addFields: {
        commentsCount: { $size: "$comments" },
      },
    },
    //  Lookup for number of likes
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "video",
        as: "likes",
      },
    },
    {
      $addFields: {
        likesCount: { $size: "$likes" },
      },
    },
    // starting of calculation of score
    {
      $addFields: {
        matchedWords: {
          $size: { $setIntersection: ["$tags", queryArray] },
        },
        engagement_rate: {
          $add: [
            { $multiply: ["$likesCount", 0.5] },
            { $multiply: ["$commentsCount", 0.3] },
            { $multiply: ["$views", 0.2] },
          ],
        },
        hoursSinceUpload: {
          $divide: [{ $subtract: [currTime, "$createdAt"] }, 1000 * 60 * 60],
        },
      },
    },
    {
      $addFields: {
        score: {
          $divide: [
            {
              $add: [
                { $multiply: ["$matchedWords", { $log: { $add: ["$views", 1] } }] },
                { $multiply: ["$engagement_rate", 2] },
                { $cond: [{ $in: ["$owner", channelIds] }, 1, 0] },
              ],
            },
            { $add: ["$hoursSinceUpload", 10] },
          ],
        },
      },
    },
    {
      $sort: { score: -1, createdAt: -1 },
    },
    {
      $project: {
        title: 1,
        thumbnail: 1,
        views: 1,
        createdAt: 1,
        owner: 1,
        duration: 1,
        score: 1,
        likesCount: 1,
        commentsCount: 1,
      },
    },
  ];

  const options = {
    page,
    limit,
  }

  const videos = await Video.aggregatePaginate(Video.aggregate(pipeline), options);

  if (!videos || videos.docs.length === 0)
  return res.status(200).json(new ApiResponse(200, [], "No results found"));

  res
  .status(200)
  .json(new ApiResponse(200, videos, "Videos found successfully"));
});


// get all vids of a user
const getAllVideosOfUser = asyncHandler(async (req, res) => {

  // get user id from req.params
  // get user id from req.user
  // check if both user id exists
  // get videos of user from db
  // send response
  // need to apply pagination
  // ** forgot that to show them based on privacy

  const {user_id} = req.params;
  const page = Math.max(1,parseInt(req.query.page) || 1);
  const limit = Math.min(30, parseInt(req.query.limit) || 10);

  if(!mongoose.Types.ObjectId.isValid(user_id)){
    throw new ApiError(400, "Invalid user ID");
  }

  const userFound = await User.findById(user_id);

  if(!userFound) throw new ApiError(404, "User not found");

  const authUserId = req.user?._id;

  const isOwner = authUserId.equals(userFound._id);

  const pipeline = [
    {
      $match: {
        owner: new mongoose.Types.ObjectId(user_id),
        ...(isOwner ? {} : { isPublic: true })
      }
    },
    {
      $sort: {
        createdAt: -1
      }
    },
    {
      $project: {
        title: 1,
        thumbnail: 1,
        createdAt: 1,
        _id: 1,
        views: 1,
        duration: 1
      }
    }
];

  const options = {
    page: page,
    limit: limit,
  };

  const videosFound = await Video.aggregatePaginate(Video.aggregate(pipeline), options);

  res
  .status(200)
  .json(new ApiResponse(200, videosFound, "Videos found successfully"));
  
});


// get a vid  by id
const getVideoById = asyncHandler(async (req, res) => {

  // get vid id from req.params
  // check if vid id is valid
  // get video from db
  // if video not found, throw error
  // send response
  // **forgot to inc view count
  // **forgot to consider for private videos

  const {video_id} = req.params;

  if(!mongoose.Types.ObjectId.isValid(video_id)){
    throw new ApiError(400, "Invalid video ID");
  }

  const user_id = req.user?._id ;

  if(!mongoose.Types.ObjectId.isValid(user_id)){
    throw new ApiError(400, "Invalid user ID");
  }

  const userFound = await User.findById(user_id);

  if(!userFound) throw new ApiError(404, "User not found");

  const videoFound = await Video.findById(video_id);

  if(!videoFound) throw new ApiError(404, "Video not found");

  if (!videoFound.isPublic && !videoFound.owner.equals(req.user._id)) {
    throw new ApiError(403, "You are not authorized to view this video");
  }

  const updatedVideo = await Video.findByIdAndUpdate(video_id, { $inc: { views: 1 } }, { new: true });

  res
  .status(200)
  .json(new ApiResponse(200, updatedVideo, "Video found successfully"));
  
});


// toggle publish status of a video
const toggleVideoStatus = asyncHandler(async (req, res) => {

  // get vid id from req.params
  // check if vid id is valid
  // check if video exists
  // get user id from req.user
  // check if user is owner of video
  // toggle video status
  // send response

  const {video_id} = req.params;

  if(!mongoose.Types.ObjectId.isValid(video_id)) throw new ApiError(400, "Invalid video ID");

  const videoFound = await Video.findById(video_id);

  if(!videoFound) throw new ApiError(404, "Video not found");

  const user_id = req.user._id;

  if(!videoFound.owner.equals(user_id)) throw new ApiError(403, "You are not authorized to update this video");

  const updatedVideo = await Video.findByIdAndUpdate(
  video_id,
  [{ 
    $set: { 
      isPublic: { 
        $not: "$isPublic" 
      } 
    } 
  }],
  { new: true }
);


  res
  .status(200)
  .json(new ApiResponse(200, updatedVideo, "Video status updated successfully"));

});


// getting all published video to show in explore page of channels the user subscribed to in sorted order of creation date
const getAllPublishedVideos = asyncHandler(async (req, res) => {

  // get the user id from req.user
  // now i need subscription model and video model
  // from subscription model i need to get all the channels[user_id] the user is subscribed to
  // from video model i need to get all the videos of those channels
  // but i need to carefully select the newest to oldest in creation date
  // send response
  // i defifnitely need pagination
  // i need to check if the video is public or not

  const user_id = req.user?._id;
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.max(1, parseInt(req.query.limit) || 10);

  // Guest User
  if (!user_id){
    const publicFeedPipeline = [
      { $match: { isPublic: true } },
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: "users",
          localField: "owner",
          foreignField: "_id",
          as: "channel"
        }
      },
      { $unwind: "$channel" },
      {
        $project: {
          title: 1,
          thumbnail: 1,
          views: 1,
          createdAt: 1,
          duration: 1,
          "channel.username": 1,
          "channel.avatar": 1
        }
      }
    ];

    let publicFeed;
    try {
      publicFeed = await Video.aggregatePaginate(Video.aggregate(publicFeedPipeline), { page, limit });
    } catch (err) {
      throw new ApiError(500, err.message);
    }

    return res
      .status(200)
      .json(new ApiResponse(200, publicFeed, "Videos fetched successfully"));
  }

  if (!mongoose.Types.ObjectId.isValid(user_id)) {
    throw new ApiError(400, "Invalid user ID");
  }

  const channel_ids = (await Subscription.find({subscriber: user_id})).map(subscription => subscription.channel);

  if (channel_ids.length === 0)
  return res.status(200).json(new ApiResponse(200, [], "No subscriptions found"));

  const pipeline = [
    {
      $match: {
        owner: {$in: channel_ids},
        isPublic: true
      }
    },
    {
      $sort: {
        createdAt: -1
      }
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "channel"
      }
    },
    { $unwind: "$channel" },
    {
      $project: {
        title: 1,
        thumbnail: 1,
        views: 1,
        createdAt: 1,
        owner: 1,
        duration: 1,
        "channel.username": 1,
        "channel.avatar": 1
      }
    }
  ];


  const options = {
    page,
    limit
  };

  let videos ;
  try {
    videos = await Video.aggregatePaginate(Video.aggregate(subscribedPipeline), { page, limit });
  } catch (err) {
    throw new ApiError(500, err.message);
  }
  
  res
  .status(200)
  .json(new ApiResponse(200, videos, "Videos found successfully"));

});


export {
  uploadVideo,
  updateVideo,
  deleteVideo,
  searchVideo,
  getAllVideosOfUser,
  getVideoById,
  toggleVideoStatus,
  getAllPublishedVideos,
}