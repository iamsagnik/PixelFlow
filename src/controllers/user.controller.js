import {asyncHandler} from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {

  console.log("Register route hit!");

  // got user details
  const {fullName, email, username, password} = req.body;
  console.log(fullName, email, username, password);
  console.log(req.body);

  // validation
  // if(fullName === "" || email === "" || username === "" || password === ""){
  //   throw new ApiError(400, "All fields are required");
  // }
  if(
    [fullName, email, username, password].some((value) => value?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  // checking if user already exists or not
  const existedUser = await User.findOne({
    $or: [{ email }, { username }]
  })

  console.log(existedUser);

  if(existedUser){
    throw new ApiError(409,"User with email or username already exists");
  }

  const avatarLocalPath = req.files?.avatar[0]?.path; 
  console.log("avatar uploaded");
  // const coverImageLocalPath = req.files?.coverImage[0]?.path;
  let coverImageLocalPath;
  if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
    coverImageLocalPath = req.files.coverImage[0].path;
  }
  console.log("cover image uploaded");
  
  console.log(req.files);

  // check for avatar
  if(!avatarLocalPath){
    throw new ApiError(400, "Avatar is required");
  }

  // upload on uploadCloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  // check for avatar once again
  if(!avatar){
    throw new ApiError(400, "Avatar upload failed");
  }

  // create user
  const user = await User.create({
    fullName,
    email,
    username: username.toLowerCase(),
    password,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
  });

  console.log(user);

  const createdUser =await User.findById(user._id).select(
    "-password -refreshtoken"
  );
  if(!createdUser){
    throw new ApiError(500, "Something went wrong while regestering user");
  }

  return res.status(201).json(new ApiResponse(201, "User registered successfully", createdUser));
});

export { registerUser };