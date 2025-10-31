import {v2 as cloudinary} from "cloudinary";

const assetdeletion = async (public_id) =>{
  
  // delete the images from the cloudinary
  try {
    const response = await cloudinary.uploader.destroy(public_id,{
      resource_type: "auto",
    });
    return response;
  } catch (error) {
    console.error("Error while deleting image from cloudinary", error);
    return null;
  }
}

export {assetdeletion};