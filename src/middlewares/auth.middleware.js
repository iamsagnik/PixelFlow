import {asyncHandler} from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.accessToken || req.headers?.("Authorization")?.replace("Bearer ", "");

  if(!token) return res.status(401).json({success: false, message: "Unauthorized Access"});

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

  const user = await user.findById(decodedToken?._id).select("-password -refreshToken");

  if(!user) return res.status(401).json({success: false, message: "Invalid Access Token"});

  req.user = user;
  next();
})