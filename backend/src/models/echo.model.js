import mongoose from "mongoose";

const echoSchema = new mongoose.Schema({
  owner: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  flow: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Flow', 
    required: true 
  },
  gif: { 
    type: string,
    default: null 
  },
  content: { 
    type: String, 
    trim: true 
  },
  replyTo: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Echo', 
    default: null 
  },
  likes: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Like' 
  }],
}, { 
  timestamps: true 
});


export const Echo = mongoose.model("Echo", echoSchema);