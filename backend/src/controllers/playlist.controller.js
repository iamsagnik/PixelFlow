import {asyncHandler} from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { Playlist } from "../models/playlist.model.js";
import { User } from "../models/user.model.js";
import { Video } from "../models/video.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";
import { deleteAllLikesForAsset } from "./like.controller.js";

// create a playlist
const createPlaylist = asyncHandler(async (req, res) => {

  // we get user_id from req.user
  // we check if user_id is valid
  // we get playlist name, description from req.body
  // we might get a video_id from req.body, if yes we add otherwise not
  // we create a playlist object and put necessary fields
  // **forgot to chck if with same name playlist already exists for that user


  const user_id = req.user._id;

  if(!mongoose.Types.ObjectId.isValid(user_id)){
    throw new ApiError(400, "Invalid user ID");
  }

  const userFound = await User.findById(user_id);

  if(!userFound){
    throw new ApiError(404, "User not found");
  }

  const {playlistName, description, video_id} = req.body;

  playlistName = playlistName.trim();
  description = description.trim();

  if(!playlistName || !description){
    throw new ApiError(400, "Playlist name and desciption both are required");
  }
 
  const samePlaylist = await Playlist.findOne({name: playlistName, owner: user_id});

  if(samePlaylist){
    throw new ApiError(400, "Playlist with same name already exists");
  }

  let videos = [];
  if(video_id){
    const videoFound = await Video.findById(video_id);

    if(!videoFound){
      throw new ApiError(404, "Video not found");
    }
    videos.push(video_id);
  }

  const newPlaylist = await Playlist.create({
    name: playlistName,
    description,
    owner: user_id,
    videos
  })

  return res.status(201).json(new ApiResponse(201, newPlaylist, "Playlist created successfully"));

});

// delete a playlist
const deletePlaylist = asyncHandler(async (req, res) => {

  // we get playlist_id from req.params
  // we check if playlist_id is valid
  // we get user_id from req.user
  // we check if playlist belongs to user
  // we delete the playlist
  // we send response

  const {playlist_id} = req.params;

  if(!mongoose.Types.ObjectId.isValid(playlist_id)){
    throw new ApiError(400, "Invalid playlist ID");
  }

  const playlistFound = await Playlist.findById(playlist_id);

  if(!playlistFound){
    throw new ApiError(404, "Playlist not found");
  }

  const user_id = req.user._id;

  if(!playlistFound.owner.equals(user_id)){
    throw new ApiError(403, "Unauthorized to delete this playlist");
  }

  const deletedLikes = await deleteAllLikesForAsset("playlist", playlist_id);

  if(!deletedLikes){
    throw new ApiError(500, "Error deleting likes");
  }

  const deletedPlaylist = await Playlist.findByIdAndDelete(playlist_id);

  if(!deletedPlaylist){
    throw new ApiError(500, "Error deleting playlist");
  }

  return res.status(200).json(new ApiResponse(200, deletedPlaylist, "Playlist deleted successfully"));

});

//rename ur playlist
const renamePlaylist = asyncHandler(async (req, res) => {

  // will get the playlist_id from req.params
  // will check if playlist_id is valid
  // will get user_id from req.user
  // will check if playlist belongs to user
  // will get new playlist name from req.body
  // will update the playlist name
  // will send response

  const {playlist_id} = req.params;
  
  if(!mongoose.Types.ObjectId.isValid(playlist_id)){
    throw new ApiError(400, "Invalid playlist ID");
  }

  const playlistFound = await Playlist.findById(playlist_id);

  if(!playlistFound){
    throw new ApiError(404, "Playlist not found");
  }

  const user_id = req.user._id;

  if(!playlistFound.owner.equals(user_id)){
    throw new ApiError(403, "Unauthorized to rename this playlist");
  }

  let {newPlaylistName} = req.body;
  newPlaylistName = newPlaylistName.trim();

  if(!newPlaylistName){
    throw new ApiError(400, "Playlist name is required");
  }

  const updatedPlaylist = await Playlist.findByIdAndUpdate(playlist_id, {name: newPlaylistName}, {new: true});

  return res.status(200).json(new ApiResponse(200, updatedPlaylist, "Playlist renamed successfully"));
});

// add video to a playlist
const addVideoToPlaylist = asyncHandler(async (req, res) => {

  // we get playlist_id and video_id from req.params
  // we check if playlist_id and video_id is valid
  // we get user_id from req.user
  // we check if playlist belongs to user
  // we check if video is already in playlist
  // we add video to playlist
  // we send response

  const {playlist_id, video_id} = req.params;

  if(!mongoose.Types.ObjectId.isValid(playlist_id)){
    throw new ApiError(400, "Invalid playlist ID");
  }

  if(!mongoose.Types.ObjectId.isValid(video_id)){
    throw new ApiError(400, "Invalid video ID");
  }

  const playlistFound = await Playlist.findById(playlist_id);

  if(!playlistFound){
    throw new ApiError(404, "Playlist not found");
  }

  const videoFound = await Video.findById(video_id);

  if(!videoFound){
    throw new ApiError(404, "Video not found");
  }

  const user_id = req.user._id;

  if(!playlistFound.owner.equals(user_id)){
    throw new ApiError(403, "Unauthorized to add video to this playlist");
  }

  if(playlistFound.videos.some(v => v.equals(video_id))){
    throw new ApiError(400, "Video already in playlist");
  }

  playlistFound.videos.push(video_id);
  const updatedPlaylist = await playlistFound.save();

  return res.status(200).json(new ApiResponse(200, updatedPlaylist, "Video added to playlist successfully"));
});

// remove video from a playlist
const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  
  // we get playlist_id and video_id from req.params
  // we check if playlist_id and video_id is valid
  // we check if playlist exists
  // we get user_id from req.user
  // we check if playlist belongs to user  
  // we check if video is in playlist
  // we remove video from playlist
  // we send response

  const {playlist_id, video_id} = req.params;

  if(!mongoose.Types.ObjectId.isValid(playlist_id)){
    throw new ApiError(400, "Invalid playlist ID");
  }

  if(!mongoose.Types.ObjectId.isValid(video_id)){
    throw new ApiError(400, "Invalid video ID");
  }

  const playlistFound = await Playlist.findById(playlist_id);

  if(!playlistFound){
    throw new ApiError(404, "Playlist not found");
  }

  const user_id = req.user._id;

  if(!playlistFound.owner.equals(user_id)){
    throw new ApiError(403, "Unauthorized to remove video from this playlist");
  }

  if(!playlistFound.videos.some(v => v.equals(video_id))){
    throw new ApiError(400, "Video not in playlist");
  }

  playlistFound.videos = playlistFound.videos.filter(v => !v.equals(video_id));
  const updatedPlaylist = await playlistFound.save();

  return res.status(200).json(new ApiResponse(200, updatedPlaylist, "Video removed from playlist successfully"));

});

// show all playlists of a user
const getAllPlaylistsOfUser = asyncHandler(async (req, res) => {
  
  // we get user_id from req.params
  // we check if user_id is valid
  // we compare user_id with req.user._id, only if they are same we send response
  // we get all playlists of user steps :
  // we match user_id with playlist owner and set page and limit also for pagination
  // we send response

  const {user_id} = req.params;

  if(!mongoose.Types.ObjectId.isValid(user_id)){
    throw new ApiError(400, "Invalid user ID");
  }

  const userFound = await User.findById(user_id);

  if(!userFound){
    throw new ApiError(404, "User not found");
  }

  if(req.user._id.toString() !== user_id){
    throw new ApiError(403, "Unauthorized to get all playlists of this user");
  }

  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(30, parseInt(req.query.limit) || 10);

  const pipeline = [
    {
      $match: {
        owner: user_id,
      }
    },
    {
      $sort: {
        createdAt: -1,
      }
    },
  ];

  const options = {
    page,
    limit,
  };

  const playlists = await Playlist.aggregatePaginate(Playlist.aggregate(pipeline), options);

  return res.status(200).json(new ApiResponse(200, playlists, "Playlists fetched successfully"));

});

export {
  createPlaylist,
  deletePlaylist,
  renamePlaylist,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  getAllPlaylistsOfUser
}