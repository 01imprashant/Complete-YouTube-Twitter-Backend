import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    // get channelId from frontend
    const { channelId } = req.params;
    // TODO: toggle subscription
    // check channelId is valid or not
    if(!channelId || !isValidObjectId(channelId)){
        throw new ApiError(400, "Invalid channelId")
    }
    // find userId from user
    const userId = req.user._id;
    // check userId is validor not 
    if(!userId || !isValidObjectId(userId)){
        throw new ApiError(400, "invalid UserId")
    }
    // check user subscribed or not
    const subscribed = await Subscription.findById({
        channel: channelId,
        subscriber: userId,
    })
    // user subscribed nhi hai to subscribed kardo
    if(!subscribed){
        const subscribe = await Subscription.create({
            channel: channelId,
            subscriber: userId,
        })

        if(!subscribe){
            throw new ApiError(500, "Error while subscribing to the channel")
        }

        return res
        .status(200)
        .json(new ApiResponse(200, subscribe, "Channel Subscribed"))
    }
    // user subscribed hai to unsubscribed kardo
    const unsubscribe = await Subscription.deleteOne(subscribed?._id)
    
    if(!unsubscribe){
        throw new ApiError(500, unsubscribe, "Error while unsubscribing the channel")
    }
    return res
    .status(200)
    .json(new ApiResponse(200, unsubscribe,"Channel Unsubscribed"))

})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    // get channelId from frontend
    const { channelId } = req.params;
    // check channelid is valid or not
    if(!channelId || !isValidObjectId(channelId)){
        throw new ApiError(400, "Invalid ChannelId")
    }
    // find userId from user
    const userId = req.user._id;
    // check userId is validor not 
    if(!userId || !isValidObjectId(userId)){
        throw new ApiError(400, "invalid UserId")
    }
    const subscribersList = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "subscriber"
            }
        },
        {
            $addFields: {
                subscriber:{
                    $arrayElemAt: ["$subscriber", 0]
                }
            }
        },
        // {
        //     $group: {
        //         _id: "$channel",
        //         count: { $sum: 1 },
        //         subscribers: {
        //             $push: {
        //                 subscriberId: "$subscriber",
        //                 subscriberName: "$subscriber.name",
        //                 subscriberAvatar: "$subscriber.avatar",
        //             }
        //         }
        //     }
        // },
        {
            $project: {
                _id: 0,
                subscriberId: "$subscriber._id",
                subscriberName: "$subscriber.name",
                subscriberAvatar: "$subscriber.avatar",
            }
        }
    ])

    // const subscribersList = await Subscription.aggregate([
    //     {
    //       $match: {
    //         channel: new mongoose.Types.ObjectId(channelId),
    //       },
    //     },
    //     {
    //       $group: {
    //         _id: "$channel",
    //         subscribersCount: {
    //           $sum: 1,
    //         },
    //       },
    //     },
    //     {
    //       $project: {
    //         subscribersCount: 1,
    //         channel: 1,
    //       },
    //     },
    // ]);

    // console.log("subscriberList: ", subscribersList)
    if(!subscribersList){
        throw new ApiError(500, "Error while fetching subscribers list")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, subscribersList, "Subscribers list fetched successfully"))
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    // get subscriberId from frontend
    const { subscriberId } = req.params;
    // check subscriberId is valid or not 
    if(!subscriberId || !isValidObjectId(subscriberId)){
        throw new ApiError(400, "Invalid SubscriberId")
    }
    // find userId from user
    const userId = req.user._id;
    // check userId is valid or not
    if(!userId || !isValidObjectId(userId)){
        throw new ApiError(400, "invalid UserId")
    }
    // 
    const channelList = await Subscription.aggregate([
        {
            $match: {
                subscriber : new mongoose.Types.ObjectId(subscriberId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "channelDetails"
            }
        },
        {
            $addFields: {
                channelDetails:{
                    $arrayElemAt: ["$channelDetails", 0]
                }
            }
        },
        {
            $project: {
                _id: 0,
                channelId: "$channel",
                channelName: "$channelDetails.name",
                channelAvatar: "$channelDetails.avatar",
            }
        }
    ])

    console.log("channelList: ", channelList)
    if(!channelList){
        throw new ApiError(500, "Error while fetching channel list")
    }
    // return response 
    return res
    .status(200)
    .json(new ApiResponse(200, channelList, "Subscribed channels fetched successfully"))
    

})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}