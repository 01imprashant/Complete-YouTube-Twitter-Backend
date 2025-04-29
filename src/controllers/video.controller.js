import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.model.js"
import { User } from "../models/user.model.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"
import { uploadOnCloudinary, deleteFromCloudinary, deleteVideoFromCloudinary } from "../utils/cloudinary.js"

const getAllVideos = asyncHandler(async(req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
    // TODO: get all videos based on query, sort, pagination
    // steps to solve
    // use match for query on the basis of title or description or i think we can do channel also
    // perfom lookup for the user details for the video like username, avatar, etc
    // project the details of the user
    // use sort to sort the videos
    // for pagination use page and limit to calculate skip and limit
    
    const videos = await Video.aggregate([
        {
            $match: {
                $or: [
                    { title: { $regex: query || "", $options: "i" } },
                    { description: { $regex: query || "", $options: "i" } },
                ] 
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "createdBy",
                pipeline: [
                    {
                        $project: {
                            fullName: 1,
                            username: 1,
                            avatar: 1,
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                createdBy: {
                    $first :"$createdBy"
                }
            }
        },
        {
            $project: {
                thumbnail:1,
                videoFile:1,
                title:1,
                description:1,
                createdBy:1,
            }
        },
        {
            $sort: {
                [sortBy]: sortType === "asc" ? 1 : -1,
            }
        },
        {
            $skip: (page - 1) * limit,
        },
        {
            $limit: parseInt(limit),
        }
    ])
    // console.log("video:", videos)
    if(!videos.length){
        throw new ApiError(404, "Video Not Found")
    }
    return res
    .status(200)
    .json(new ApiResponse(200, videos[0], "Video fetched successfully"))
})

const publishAVideo = asyncHandler(async (req, res) => {
    // take title and description from frontend
    const { title, description } = req.body
    // TODO: get video, upload to cloudinary, create video
    // check title and description field 
    if(!title || !description){
        throw new ApiError(400, "Title and Description are reqired")
    }
    // upload videofile and thumbnail locally using multer
    const videoFileLocalPath = req.files?.videoFile?.[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;
    // check videofile upload successfull or not 
    if(!videoFileLocalPath){
        throw new ApiError(400, "Video file required")
    }
    // check thumbnail upload successfully or not 
    if(!thumbnailLocalPath){
        throw new ApiError(400, "Thumnail required")
    }
    // upload videofile and thumbnail on cloudinary
    const videoFile = await uploadOnCloudinary(videoFileLocalPath)
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)
    // check videofile successfully upload on cloudinary
    if(!videoFile.url){
        throw new ApiError(400, "Error on uploading video on cloudinary")
    }
    // check thumbnail successfull upload on cloudinary
    if(!thumbnail.url){
        throw new ApiError(400, "Error on uploading thumnail on cloudinary")
    }
    // create video object - create entery in db
    const video = await Video.create({
        title,
        description,
        videoFile: videoFile.url,
        thumbnail: thumbnail.url,
        duration: videoFile.duration,
        owner: req.user?._id,//doubt
        isPublished: false //true
    })
    // check video object successfully created or not
    const createdVideo = await Video.findById(video?._id)
    // check video object
    if(!createdVideo){
        throw new ApiError(500, "Error in Creating Video")
    }
    // return response
    return res
    .status(201)
    .json(new ApiResponse(200, createdVideo, "Video Publish Successfully"))

})

const getVideoById = asyncHandler(async (req, res) => {
    // get videoId from frontend
    const { videoId } = req.params;
    // TODO: get video by id
    // check videoId valid or not
    if(!videoId || !isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid videoId")
    }
    // fetch video in Video(module)
    const video = await Video.findById(videoId).populate("owner", "fullName username avatar")
    // check video successfully upload and fetched from db
    if(!video){
        throw new ApiError(404, "Video Not Found")
    }
    // return response
    return res
    .status(200)
    .json(new ApiResponse(200,video, "Video fetched successfully"))

})

const updateVideo = asyncHandler(async (req, res) => {
    // get videoId from frontend
    const { videoId } = req.params;
    //TODO: update video details like title, description, thumbnail
    // check videoId is valid or not
    if(!videoId || !isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid videoId")
    }
    // get title, description from frontend
    const { title, description } = req.body;
    // get new local thumbnail using multer
    const newThumbnailLocalPath = req.file?.path;
    // check title and description field - not empty
    if(!title || !description){
        throw new ApiError(400, "Title and description are required")
    }
    // check new local thumbnail upload successfully
    if(!newThumbnailLocalPath){
        throw new ApiError(400 ,"thumbnail is required")
    }
    // create video object using Video model
    const video = await Video.findById(videoId)
    // check video object created successfully
    if(!video){
        throw new ApiError(404, "Video Not Found")
    }
    // check video owner and video user id
    if(!video.owner.equals(req.user?._id)){
        throw new ApiError(403, "You are not allowed to update other user's video")
    }
    // upload new thumbnail on cloudinary
    const newThumbnail = await uploadOnCloudinary(newThumbnailLocalPath)
    // check new thumbnail uploaded successfully
    if(!newThumbnail){
        throw new ApiError(400, "Error on uploading newThumbnail")
    }
    // update video 
    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        {
            $set:{
                title,
                description,
                thumbnail:newThumbnail.url,
            }
        },
        {
            new: true,
            runValidators: true,
        }
    )
    // return response
    return res
    .status(200)
    .json(new ApiResponse(200, updatedVideo, "Video update Successfully"))

})

const deleteVideo = asyncHandler(async (req, res) => {
    // get videoId from frontend
    const { videoId } = req.params
    // TODO: delete video
    // check videoId is valid or not
    if(!videoId || !isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid videoId")
    }
    // check video in Video module and create video object
    const video = await Video.findById(videoId)
    // check video object
    if(!video){
        throw new ApiError(400, "Vedio Not Found")
    }
    // check video owner and video user id
    if(!video.owner.equals(req.user?._id)){
        throw new ApiError(403, "You are not allowed to update another user's video")
    }
    // delete video from cloudianry
    const deletedVideoFile = await deleteVideoFromCloudinary(video.videoFile)
    
    console.log(video.videoFile)
    // check video file deleted successfully
    if(!deletedVideoFile || deletedVideoFile.result !== "ok"){
        throw new ApiError(400, "Error while deleting video file")
    }
    // delete thumbnail from cloudinary
    const deletedThumbnail = await deleteFromCloudinary(video.thumbnail)
    // check thubnail deleted successfully
    if(!deletedThumbnail || deletedThumbnail.result !== "ok"){
        throw new ApiError(400, "Error while deleting thumbnail")
    }
    // delete video from db
    const deletedVideo = await Video.findByIdAndDelete(videoId)
    // check video deleted from db successfully
    if(!deletedVideo){
        throw new ApiError(500, "Error while deleting video")
    }
    // return response
    return res
    .status(200)
    .json(new ApiResponse(200, {} , "Video deteled Successfully"))
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    // get videoId from frontend
    const { videoId } = req.params;
    // check videoid is valid or not
    if(!videoId || !isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid VideoId")
    }
    // find video from Video module and create video object
    const video = await Video.findById(videoId)
    // check video object
    if(!video){
        throw new ApiError(400, "Video Not Found")
    }
    // check video owner and video
    if(!video.owner.equals(req.user?._id)){
        throw new ApiError(403,"You are not allowed to toggle other user's video");
    }
    // toggle video publish status
    const videoPublishStatus = await Video.findByIdAndUpdate(
        videoId,
        {
            $set:{
                isPublished: !video.isPublished,
            }
        },
        {
            new: true,
            runValidators: true,
        }
    )
    // return response
    return res
    .status(200)
    .json(new ApiResponse(200, videoPublishStatus, "Video published status modified")) 
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}