import mongoose, {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import {
  modifiedTextArray,
  removeStopWords,
  getSynonyms,
  getSingularForm,
  deleteDuplicates
} from "../utils/textModify.js";

const videoSchema = new Schema(
  {
    videoFile: {
      url: { 
        type: String, 
        required: true,
      },
      public_id: { 
        type: String, 
        required: true,
      },
    },
    thumbnail: {
      url: { 
        type: String, 
        required: true,
      },
      public_id: { 
        type: String, 
        required: true,
      },
    },
    title: {
      type: String, 
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    duration: {
      type: Number, 
      required: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    isPublic: {     // publicaly available or not
      type: Boolean,
      default: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tags:
      {
        type: [String],
        default: [],
      }
  },
  {
    timestamps: true,
  }
);

videoSchema.plugin(mongooseAggregatePaginate);
videoSchema.index({ owner: 1, createdAt: -1 });     // 1 means ascending, -1 means descending
videoSchema.index({ views: -1, tags: 1 });

videoSchema.pre("save", function (next) {
  
  if(!this.isModified("title") && !this.isModified("description")) return next();
  
  const titleArray = modifiedTextArray(this.title);
  const descriptionArray = modifiedTextArray(this.description);

  let tags = [...titleArray, ...descriptionArray];
  tags = removeStopWords(tags);
  tags = getSynonyms(tags);
  tags = getSingularForm(tags);
  tags = deleteDuplicates(tags);
  this.tags = tags;
  next();
});

export const Video = mongoose.model("Video", videoSchema);