import mongoose, {isValidObjectId} from "mongoose"
import { Like } from "../models/like.model.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    //TODO: toggle like on video
    if(!videoId || !isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid VideoId")
    }
    // find userId from user
    const userId = req.user?._id
    // check user like video or not
    const existingLike = await Like.findOne({
        video: videoId,
        likedBy: userId
    })
    let liked;
    // if user like video
    if(existingLike){
        // unlike the video
        const deleteVideoLike = await existingLike.deleteOne()
        if(!deleteVideoLike){
            throw new ApiError(500, "Failed to unlike the video")
        }
        liked = false
    }
    else{
        //like the video
        const likeVideo = await Like.create({
            video: videoId,
            likedBy: userId
        })
        if(!likeVideo){
            throw new ApiError(400, "Failed to like the video")
        }
        liked = true
    }

    const totalLikes = await  Like.countDocuments({video: videoId})

    return res
    .status(200)
    .json(new ApiResponse(200, {videoId, liked, totalLikes}, liked ? "Video liked successfully" : "Video unliked successfully"))

})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    //TODO: toggle like on comment
    if(!commentId || !isValidObjectId(commentId)){
        throw new ApiError(400, "Invalid CommentId")
    }
    // find userId from user
    const userId = req.user?._id
    // check user like comment or not
    const existingLike = await Like.findOne({
        comment: commentId,
        likedBy: userId
    })
    let liked;
    // if user like comment
    if(existingLike){
        // unlike the comment
        const deleteCommentLike = await existingLike.deleteOne()
        if(!deleteCommentLike){
            throw new ApiError(500, "Failed to unlike the comment")
        }
        liked = false
    }
    else{
        //like the comment
        const likeComment = await Like.create({
            comment: commentId,
            likedBy: userId
        })
        if(!likeComment){
            throw new ApiError(400, "Failed to like the comment")
        }
        liked = true
    }
    const totalLikes = await  Like.countDocuments({comment: commentId})
    return res
    .status(200)
    .json(new ApiResponse(200, {commentId, liked, totalLikes}, liked ? "Comment liked successfully" : "Comment unliked successfully"))

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    //TODO: toggle like on tweet
    if(!tweetId || !isValidObjectId(tweetId)){
        throw new ApiError(400, "Invalid TweetId")
    }
    // find userId from user
    const userId = req.user?._id
    // check user like tweet or not
    const existingLike = await Like.findOne({
        tweet: tweetId,
        likedBy: userId
    })
    let liked;
    // if user like tweet
    if(existingLike){
        // unlike the tweet
        const deleteTweetLike = await existingLike.deleteOne()
        if(!deleteTweetLike){
            throw new ApiError(500, "Failed to unlike the tweet")
        }
        liked = false
    }
    else{
        //like the tweet
        const likeTweet = await Like.create({
            tweet: tweetId,
            likedBy: userId
        })
        if(!likeTweet){
            throw new ApiError(400, "Failed to like the tweet")
        }
        liked = true
    }
    const totalLikes = await  Like.countDocuments({tweet: tweetId})
    return res
    .status(200)
    .json(new ApiResponse(200, {tweetId, liked, totalLikes}, liked ? "Tweet liked successfully" : "Tweet unliked successfully"))
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    const userId = req.user?._id
    if (!userId) {
        return res
        .status(401)
        .json(new ApiResponse(401, null, "User not authenticated"));
    }
    const likedVideos = await Like.find({likedBy: userId})
    .populate({
        path: 'video',
        select: 'title description'
    })
    return res
    .status(200)
    .json(new ApiResponse(200, likedVideos, "Liked videos retrieved successfully"))
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}