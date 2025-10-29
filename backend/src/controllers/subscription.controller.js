import {asyncHandler} from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { Subscription } from "../models/subscription.model.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";


// show all subscriber of a user/channel
const getSubscribers = asyncHandler(async (req, res) => {

  // we get channel_id from req.params
  // we check if channel_id is valid
  // we check if channel exists
  // we get user_id from req.user and check if it is valid
  // compare user_id and channel_id, if same then only send response
  // we get subscribers of channel
  // we send response

  const {channel_id} = req.params;

  if(!mongoose.Types.ObjectId.isValid(channel_id)){
    throw new ApiError(400, "Invalid channel ID");
  }

  const channelFound = await User.findById(channel_id);

  if(!channelFound){
    throw new ApiError(404, "Channel not found");
  }

  const user_id = req.user._id;

  if(!mongoose.Types.ObjectId.isValid(user_id)){
    throw new ApiError(400, "Invalid user ID");
  }

  if(!channelFound._id.equals(user_id)){
    throw new ApiError(403, "Unauthorized to get subscribers of this channel");
  }

  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(30, parseInt(req.query.limit) || 10);

  pipeline = [
    {
      $match: {
        channel: new mongoose.Types.ObjectId(channel_id),
      }
    }
  ];

  Options = {
    page: page,
    limit: limit
  }

  const subscribers = await Subscription.aggregatePaginate(Subscription.aggregate(pipeline), Options);

  res.status(200).json(new ApiResponse(200, subscribers, "Subscribers fetched successfully"));

});


// show a user is subscribed to which channels
const getSubscriptions = asyncHandler(async (req, res) => {
  
  // we get user_id from req.params
  // we check if user_id is valid
  // we check if user exists
  // we get user_id from req.user and check if it is valid
  // compare user_id and user_id, if same then only send response
  // we get subscriptions of user
  // we send response

  const {user_id} = req.params;

  if(!mongoose.Types.ObjectId.isValid(user_id)){
    throw new ApiError(400, "Invalid user ID");
  }

  const userFound = await User.findById(user_id);

  if(!userFound){
    throw new ApiError(404, "User not found");
  }

  const user_id_body = req.user._id;

  if(!mongoose.Types.ObjectId.isValid(user_id_body)){
    throw new ApiError(400, "Invalid user ID");
  }

  if(!userFound._id.equals(user_id_body)){
    throw new ApiError(403, "Unauthorized to get subscriptions of this user");
  }

  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(30, parseInt(req.query.limit) || 10);

  pipeline = [
    {
      $match: {
        subscriber: new mongoose.Types.ObjectId(user_id),
      }
    },
    {
      $sort: {
        createdAt: -1
      }
    }
  ];

  Options = {
    page: page,
    limit: limit
  }

  const subscriptions = await Subscription.aggregatePaginate(Subscription.aggregate(pipeline), Options);

  res.status(200).json(new ApiResponse(200, subscriptions, "Subscriptions fetched successfully"));

});


// Adding a new subscription if it doesn’t exist 
// and Removing (unsubscribing) if it already exists.
const toggleSubscription = asyncHandler(async (req, res) => {

  // we get channel_id from req.params
  // we check if channel_id is valid
  // we check if channel exists
  // we get user_id from req.user and check if it is valid
  // we check if user is already subscribed to channel
  // if yes then unsubscribe
  // if no then subscribe
  // we send response
  // **forgot to check if he is self subscribing to his channel, have to prevent that

  const {channel_id} = req.params;

  if(!mongoose.Types.ObjectId.isValid(channel_id)){
    throw new ApiError(400, "Invalid channel ID");
  }

  const channelFound = await User.findById(channel_id);

  if(!channelFound){
    throw new ApiError(404, "Channel not found");
  }

  const user_id = req.user._id;

  if(!mongoose.Types.ObjectId.isValid(user_id)){
    throw new ApiError(400, "Invalid user ID");
  }

  if(channelFound._id.equals(user_id)){
    throw new ApiError(403, "Not allowed to subscribe to your own channel");
  }

  const isSubscribed = await Subscription.findOne({
    channel: new mongoose.Types.ObjectId(channel_id),
    subscriber: new mongoose.Types.ObjectId(user_id)
  });

  if(isSubscribed){
    await Subscription.deleteOne({
      channel: new mongoose.Types.ObjectId(channel_id),
      subscriber: new mongoose.Types.ObjectId(user_id)
    });
    res.status(200).json(new ApiResponse(200, null, "Unsubscribed successfully"));
  }
  else{
    const newSubscription = await Subscription.create({
      channel: new mongoose.Types.ObjectId(channel_id),
      subscriber: new mongoose.Types.ObjectId(user_id)
    });
    res.status(200).json(new ApiResponse(200, newSubscription, "Subscribed successfully"));
  }
});

export {
  getSubscribers,
  getSubscriptions,
  isSubscribed
}
