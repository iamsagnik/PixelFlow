import {asyncHandler} from "../utils/asyncHandler.js";

const registerUser = asyncHandler(async (req, res) => {
  console.log("Register route hit!");
  res.status(200).json({
    success: true, 
    message: "User registered successfully"
  })
});

export {registerUser};