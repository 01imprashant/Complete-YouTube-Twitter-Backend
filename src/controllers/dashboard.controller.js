import mongoose from "mongoose"
import { Video } from "../models/video.model.js"
import { Subscription } from "../models/subscription.model.js"
import { Like } from "../models/like.model.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    const channelId = req.user._id
    if (!channelId) {
        throw new ApiError(400, "Channel ID is required")
    }
    if (!mongoose.isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid Channel ID")
    }
    const totalVideos = await Video.countDocuments(
        { 
            owner: channelId
        }
    )
    const totalSubscribers = await Subscription.countDocuments(
        { 
            channel: channelId
        }
    )
    const totalLikes = await Like.countDocuments(
        { 
            owner: channelId
        }
    )
    const totalViews = await Video.aggregate([
        { 
            $match: { 
                owner: channelId
             }
        },
        { 
            $group: { 
                _id: null,
                 totalViews: { 
                    $sum: "$views"
                  } 
            } 
        }
    ])
    const totalViewsCount = totalViews.length > 0 ? totalViews[0].totalViews : 0
    const channelStats = {
        totalVideos,
        totalSubscribers,
        totalLikes,
        totalViews: totalViewsCount
    }
    return res
    .status(200)
    .json(new ApiResponse(200, "Channel stats fetched successfully", channelStats))
})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    const channelId = req.user._id
    if (!channelId) {
        throw new ApiError(400, "Channel ID is required")
    }
    if (!mongoose.isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid Channel ID")
    }
    const { page = 1, limit = 10 } = req.query
    const videos = await Video.find({ owner: channelId })
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 })
        .populate("owner", "fullName avatar username")
        // .populate("username", "user")
        // .populate("comments", "user content")
    if (!videos) {
        throw new ApiError(404, "No videos found")
    }
    return res
    .status(200)
    .json(new ApiResponse(200, videos, "Videos fetched successfully"))
})

export {
    getChannelStats, 
    getChannelVideos
}