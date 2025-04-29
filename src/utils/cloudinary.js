import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary=async function(localFilePath) {
    try {
        if(!localFilePath){
            // console.log("File path is required");
            return null;
        }
        const response = await cloudinary.uploader.upload(localFilePath, {
                resource_type: "auto",
            }
        )
        // console.log("File is uploaded on cloudinary", response);
        // file has been uploaded on cloudinary successfully
        // console.log("File is uploaded on cloudinary",response.url);
        // fs.unlinkSync(localFilePath);// delete the file from local storage
        if(fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }
        return response;
    } catch (error) {
        // delete the file from local storage
        fs.unlinkSync(localFilePath);
        console.log("Error while uploading file on Cloudinary", error);
        throw new Error("Error while uploading file on Cloudinary");

    }  
}

const deleteFromCloudinary = async (cloudinaryUrl) => {
    try {
      // Extract the public ID from the URL
      const publicId = cloudinaryUrl.split("/").pop().split(".")[0];
  
      // Delete the file using the public ID
      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: "image"
      });
     //  console.log("Deleted:", result);
  
      return result;
    } catch (error) {
      console.log("Error deleting thubnail from cloudinary:", error);
      throw new Error("Error while deleting thumbnail from cloudinary")
    }
  };
  
  const deleteVideoFromCloudinary = async (cloudinaryUrl) => {
    try {
      // Extract the public ID from the URL
      // console.log("Input cloudinaryUrl:", cloudinaryUrl);
      const urlParts = cloudinaryUrl.split("/");
      const publicIdWithExtension = urlParts[urlParts.length - 1];
      const publicId = publicIdWithExtension.split(".")[0];
      // console.log("Extracted publicId:", publicId); 
  
      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: "video",
      });
      // console.log("Deleted:", result);
  
      return result;
    } catch (error) {
      console.error("Error deleting video from cloudinary:", error);
      return { result: "error", message: error.message };
    }
  };

export  { uploadOnCloudinary, deleteFromCloudinary, deleteVideoFromCloudinary };






// import { v2 as cloudinary } from 'cloudinary';

// (async function(localFilePath) {

//     // Configuration
//     cloudinary.config({ 
//     cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
//     api_key: process.env.CLOUDINARY_API_KEY, 
//    api_secret: process.env.CLOUDINARY_API_SECRET,
//     });
    
//     // Upload an image
//      const uploadResult = await cloudinary.uploader
//        .upload(
//            localFilePath, {
//               resource_type: "auto",
//            }
//        )
//        .catch((error) => {
//            console.log(error);
//        });
    
//     console.log(uploadResult);
        
// })();