import mongoose, {Schema, model} from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new Schema
(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    avatar: {
      type: String,  // cloudinary url
      required: true,
      default: "",
    },
    coverImage: {
      url: { 
        type: String, 
        default: "https://i.pinimg.com/736x/62/01/0d/62010d848b790a2336d1542fcda51789.jpg",
      },
      public_id: { 
        type: String, 
        default: "none",
      },
    },
    watchHistory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video"
      }
    ],
    refreshToken: {
      type: String,
    }
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.isPasswordCorrect = async function(password){
  return await bcrypt.compare(password, this.password);
}

userSchema.methods.generateAccessToken = function(){
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      fullName: this.fullName
    }, 
    process.env.ACCESS_TOKEN_SECRET, 
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    }
  );
}

userSchema.methods.generateRefreshToken = function(){
  return jwt.sign(
    {
      _id: this._id,
    }, 
    process.env.REFRESH_TOKEN_SECRET, 
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    }
  );
}

export const User = model("User", userSchema);