import mongoose, { isValidObjectId } from "mongoose"
import { Tweet } from "../models/tweet.model.js"
import { User } from "../models/user.model.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const { content } = req.body
    if (!content) {
        throw new ApiError(400, "Content is required")
    }
    const userId  = req.user?._id
    if (!userId) {
        throw new ApiError(400, "User ID is required")
    }
    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid User ID")
    }
    const user = await User.findById(userId)
    if (!user) {
        throw new ApiError(404, "User not found")
    }
    const tweet = await Tweet.create({
        content,
        owner: userId
    })
    if (!tweet) {
        throw new ApiError(500, "Failed to create tweet")
    }
    return res
    .status(201)
    .json(new ApiResponse(201, "Tweet created successfully", tweet))
})

const getUserTweets = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;
  
    if (!userId || !isValidObjectId(userId)) {
      throw new ApiError(400, "Invalid userId");
    }
  
    const tweets = await Tweet.aggregate([
      {
        $match: {
          owner: new mongoose.Types.ObjectId(userId),
        }
      },
      {
        $sort: {
          createdAt: -1, // sort by newest tweets first
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "owner",
          foreignField: "_id",
          as: "owner",
          pipeline: [
            {
              $project: {
                username: 1,
                fullname: 1,
                avatar: 1
              }
            }
          ]
        }
      },
      {
        $addFields: {
          owner: {
            $first: "$owner",
          }
        }
      },
      {
        $project: {
          content: 1,
          owner: 1,
          createdAt: 1
        }
      },
      //pagination
      {
        $skip: (page - 1) * limit,
      },
      {
        $limit: parseInt(limit),
      }
    ])
  
    if (!tweets) {
      throw new ApiError(400, "Failed to fetch the tweets");
    }
  
    return res
    .status(200)
    .json(new ApiResponse(200, tweets[0], "Tweets fetched successfully"))

    // // TODO: get user tweets
    // const userId = req.params.userId
    // if (!userId) {
    //     throw new ApiError(400, "User ID is required")
    // }
    // if (!isValidObjectId(userId)) {
    //     throw new ApiError(400, "Invalid User ID")
    // }
    // const user = await User.findById(userId)
    // if (!user) {
    //     throw new ApiError(404, "User not found")
    // }
    // const tweets = await Tweet.find({ owner: userId })
    // if (!tweets) {
    //     throw new ApiError(404, "No tweets found")
    // }
    // return res
    // .status(200)
    // .json(new ApiResponse(200, tweets, "Tweets retrieved successfully"))

})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const { tweetId } = req.params
    const { content } = req.body
    if (!tweetId) {
        throw new ApiError(400, "Tweet ID is required")
    }
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid Tweet ID")
    }
    if (!content) {
        throw new ApiError(400, "Content is required")
    }
    const tweet = await Tweet.findById(tweetId)
    if (tweet.length === 0) {
        throw new ApiError(404, "Tweet not found")
    }
    if (tweet.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this tweet")
    }
    const updateTweet = await Tweet.findByIdAndUpdate(
        tweetId,
        { 
           $set:{
                content: content
            } 
        }, 
        { 
            new: true,
            validateBeforeSave: true,
        }
    )

    if (!updateTweet) {
        throw new ApiError(500, "Failed to update tweet")
    }
    return res
    .status(200)
    .json(new ApiResponse(200, "Tweet updated successfully", tweet))
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const { tweetId } = req.params
    if (!tweetId) {
        throw new ApiError(400, "Tweet ID is required")
    }
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid Tweet ID")
    }
    const tweet = await Tweet.findById(tweetId)
    if (!tweet) {
        throw new ApiError(404, "Tweet not found")
    }
    if (tweet.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to delete this tweet")
    }
    const deletedTweet = await Tweet.findByIdAndDelete(tweetId)
    if (!deletedTweet) {
        throw new ApiError(500, "Failed to delete tweet")
    }
    return res
    .status(200)
    .json(new ApiResponse(200, deletedTweet, "Tweet deleted successfully"))
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}