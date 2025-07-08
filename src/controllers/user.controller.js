import {asyncHandler} from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const generateAccessandRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ValidateBeforeSave: false});

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Token generation failed");
  }

}

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

const loginUser = asyncHandler(async (req, res) => {

  // take email and password from the user req body
  // check if user exists or not
  // check if password is correct or not
  // generate refresh and access tokens
  // send secure cookies to the user

  const {fullName, email, username, password} = req.body;

  if(!(email || username)){
    throw new ApiError(400, "Username or email is required");
  }

  const user = await User.findOne({
    $or: [{ email }, { username }]
  });

  if(!user){
    throw new ApiError(404, "User not found");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if(!isPasswordValid){
    throw new ApiError(401, "Password is incorrect");
  }

  const {accessToken, refreshToken} = await generateAccessandRefreshTokens(user._id);

  const loggedUser = await User.findById(user._id).select(
    "-password -refreshtoken"
  );

  const options = {
    // expires: new Date(Date.now() + process.env.COOKIE_EXPIRY * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: true,
    // sameSite: "none"
  }

  return res
  .status(200)
  .cookie("accessToken", accessToken, options)
  .cookie("refreshToken", refreshToken, options)
  .json(
    new ApiResponse(
      200,
      {
        user: loggedUser, accessToken, refreshToken
      }, 
      "User logged in successfully"
    ));
});

const logoutUser = asyncHandler(async (req, res) => {

  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined
      }
    },
    {
      new: true
    }
  )

  const options = {
    httpOnly: true,
    secure: true,
  }

  return res
  .status(200)
  .clearCookie("accessToken", options)
  .clearCookie("refreshToken", options)
  .json(new ApiResponse(200, "User logged out successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

  if(!incomingRefreshToken){
    throw new ApiError(400, "Unauthorized Access");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken, 
      process.env.REFRESH_TOKEN_SECRET
    );
  
    const user = await User.findById(decodedToken?._id);
  
    if(!user){
      throw new ApiError(401, "Invalid Refresh Token");
    }
  
    if(incomingRefreshToken !== user?.refreshToken){
      throw new ApiError(401, "Refresh Token is expired or used");
    }
  
    const options = {
      httpOnly: true,
      secure: true,
    }
  
    const {accessToken, NewrefreshToken} = await generateAccessandRefreshTokens(user._id);
  
    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", NewrefreshToken, options)
    .json(
      new ApiResponse(
        200, 
        {accessToken, refreshToken: NewrefreshToken},
        "Access token refreshed successfully")
    );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid Refresh Token");
    
  }


});

export { 
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken
};