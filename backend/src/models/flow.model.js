import mongoose from "mongoose";

const flowSchema = new mongoose.Schema({
  creator: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  caption: { 
    type: String, 
    trim: true 
  },
  video_ids: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Video' 
  }],
  tags: [{ 
    type: String, 
    index: true 
  }]
}, { 
  timestamps: true 
});


export const Flow = mongoose.model("Flow", flowSchema);