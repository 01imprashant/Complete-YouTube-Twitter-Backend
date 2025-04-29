import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary }  from "../utils/cloudinary.js";
import ApiResponse from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const generateAccessTokenAndRefreshToken =  async(userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });
        return { accessToken, refreshToken}
    } catch (error) {
        throw new ApiError(500, "Error while generating tokens")
    }
}

const registerUser = asyncHandler(async(req, res) => {
    // get user details from frontend
    const { fullName, email, username, password } = req.body;
    // console.log("emial:", email);
    // validation check - not empty
    if(!fullName || !email || !username || !password){
        throw new ApiError(400, "All fields are required");    
    }
    // check if user already exists - username or email
    const existedUser = await User.findOne({
        $or:[
            { email },
            { username },
        ]
    })
    // if user already present
    if(existedUser){
        throw new ApiError(409, "User already Exists");
    }
    // check for image, check for avatar
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;
    // console.log(req.files)
    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path;
    }
    // console.log(req.files);
    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar Required");
    }
    // upload them to cloudinary, check avatar
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    // check if avatar successfully uploaded on cloudinary or not
    if(!avatar){
        throw new ApiError(400, "Error while uploading avatar");
    }
    // create user object - create entry in db
    const user = await User.create({
        fullName,
        email,
        username: username.toLowerCase(),
        password,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
    })
    // remove password and refesh token field from response
    const createdUser = await User.findById(user._id).select("-password -refreshToken")
    // check for user creation
    if(!createdUser){
        throw new ApiError(500, "Error in Creating User")
    }
    // return response
    return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User Register Successfully"))  
});

const logInUser = asyncHandler(async(req, res) => {
    // get user details from frontend
    const { username, email, password } = req.body;
    // validation check - not empty
    if(!( username || email )){
        throw new ApiError(400, "username or email required");
    }
    // find user in db
    const user = await User.findOne({
        $or:[
            { username },
            { email }
        ]
    })
    if(!user){
        throw new ApiError(401, "user not exist")
    }
    // check password
    const isPasswordMatched = await user.comparePassword(password);
    if(!isPasswordMatched){
        throw new ApiError(401, "Invalid Password")
    }
    // generate accesstoken and refreshtoken
    const { accessToken, refreshToken } = await generateAccessTokenAndRefreshToken(user._id);
    // remove password and refresh Token field from response
    const logedInUser = await User.findById(user._id).select("-password -refreshToken");
    // send cookies
    const options ={
        httpOnly: true,
        secure: true,
    }
    // return response
    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
        200,
        {
            user: logedInUser, accessToken, refreshToken,
        },
        "User LogedIn Successfully")
    )   
})

const logOutUser = asyncHandler(async(req, res) => {
    // find user in req.user
    await User.findByIdAndUpdate(
        req.user._id, 
        { 
            $unset:{
                refreshToken: 1,
            }
        },
        {
            new: true,
            runValidators: true
        }
    )
    // send cookies
    const options = {
        httpOnly: true,
        secure: true,
    }
    // return response
    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User LogedOut Successfully"))
})

const refeshAccessToken = asyncHandler(async (req, res) => {
    // take refresh token from frontend  
    const incomingRefreshToken = req.cookies?.refreshToken || req.body.refreshToken;
    // check incoming token is valid or not
    if(!incomingRefreshToken){
        throw new ApiError(401, "unauthorized request")
    }
    try {
        // decode incoming refresh token
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
        // find user correspond to above decodedtoken
        const user = await User.findById(decodedToken?._id)
        // check user validity
        if(!user){
            throw new ApiError(401, "Invalid Refresh Token") 
        }
        // match incomingRefreshToken and User->refreshToken
        if(incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401, "Refresh Token expires or used")
        }
        // generate new accessToken and refreshToken
        const { accessToken, refreshToken } = await generateAccessTokenAndRefreshToken(user._id)
        // send cookies
        const options={
            httpOnly: true,
            secure: true,
        }
        // return response
        return res
        .status(201)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    accessToken,
                    refreshToken,
                },
                "Access token Refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Refresh token")
    }
})

const changeCurrentPassword = asyncHandler(async(req, res) => {
    // get user credentials from frontend
    const { oldPassword, newPassword, confPassword } = req.body;
    // check all credential present or not
    if(!oldPassword || !newPassword || !confPassword){
        throw new ApiError(400, "All the fields are required")
    }
    // check newPassword and confPassword is same or not
    if(!(newPassword === confPassword)){
        throw new ApiError(400, "New Password and Confirm Password should be same")
    }
    // find user in db
    const user = await User.findById(req.user?._id)
    // confirm user old password and store
    const isPasswordCorrect = await user.comparePassword(oldPassword)

    if(!isPasswordCorrect){
        throw new ApiError(401, "old password is incorrect")
    }
    // update user password
    user.password = newPassword;
    // save in db
    await user.save({ validateBeforeSave: false})
    // return response
    return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password Changed Successfully"))
})

const getCurrentUser = asyncHandler(async(req,res) => {
    // get user from req.user
    return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Current User"))
})

const updateAccountDetails = asyncHandler(async(req, res) => {
    // get details from frontend
    const { fullName, email, username } = req.body;
    // check details
    if(!fullName || !email || !username){
        throw new ApiError(400, "All the fields are required")
    }
    // update user details
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
           $set:{
            fullName,
            email,
            username: username.toLowerCase(),
           }
        },
        { 
            new: true, 
            runValidators: true,
        }
    ).select("-password")
    // return response
    return res
    .status(200)
    .json(new ApiResponse(200, user, "User Updated Successfully"))

})

const updateUserAvatar =asyncHandler(async(req, res) => {
    // get  avatar local path from multer
    const avatarLocalPath = req.file?.path;
    // check avatar local path
    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar Required");
    }
    // upload on cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath)

    // TODO: delete old avatar from cloudinary

    // check successfully upload on cloudinary
    if(!avatar.url){
        throw new ApiError(400, "Error on uploading avatar")
    }
    // update in db
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.url,
            }
        },
        {
            new: true,
            runValidators: true,
        }
    ).select("-password")
    // return response
    return res
    .status(200)
    .json( new ApiResponse(200, user, "Avatar Updated Successfully"))

})

const updateUserCoverImage = asyncHandler(async(req,res) => {
    // get cover image local path using multer
    const coverImageLocalPath = req.file?.path;
    // check cover image local path
    if(!coverImageLocalPath){
        throw new ApiError(400, "Cover Image Required");
    }
    // upload on cloudinary
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    // TODO: delete old cover image from cloudinary

    // check successfully upload on cloudinay
    if(!coverImage.url){
        throw new ApiError(400, " Error on Uploading Cover Image")
    }
    // update in db
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                coverImage: coverImage.url || ""
            }
        },
        {
            new: true,
            runValidators: true,
        }
    ).select("-password")
    // return response
    return res
    .status(200)
    .json(new ApiResponse(200, user ,"Cover Image Updated Successfully"))

})

const getUserChannelProfile = asyncHandler(async(req, res) => {
    // get username from url
    const { username } = req.params;
    // check username - validation
    if(!username?.trim()){
        throw new ApiError(400, "Username is missing")
    }
    // join user module and subscription module
    const channel = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase(),
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers",

            }
        },
        {
           $lookup: {
                from: "subscriptions",
                localField:"_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            $addFields: {
                subscribersCount: {
                    $size: "$subscribers"
                },
                channelsSubcribedToCount: {
                    $size: "$subscribedTo"
                },
                isSubscribed:{
                    $cond: {
                        if: {$in: [ req.user?._id, "$subscribers.subscriber" ]},
                        then: true,
                        else: false,
                    }
                }
            }
        },
        {
            $project: {

                fullName: 1,
                username: 1,
                avatar: 1,
                coverImage: 1,
                subscribersCount: 1,
                channelsSubcribedToCount: 1,
                isSubscribed: 1,
            }
        }
    ])
    // console.log("channel", channel)
    // check channel - validation
    if(!channel?.length){
        throw new ApiError(404, "Channel Not Found")
    }
    // return response
    return res
    .status(200)
    .json(new ApiResponse(200, channel[0], "Channel Profile Fetched Successfully"))
})

const getWatchHistory = asyncHandler(async(req,res) => {
    // join user module and video module
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1,
                                    }
                                },
                            ]
                        }
                    },
                    {
                        $addFields: {
                            owner: {
                                $first: "$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])
    // return response
    return res
    .status(200)
    .json(new ApiResponse(200, user[0].watchHistory, "Watch History fetched Successfully"))
})


export { 
    registerUser, 
    logInUser, 
    logOutUser, 
    refeshAccessToken,
    changeCurrentPassword,  
    getCurrentUser, 
    updateAccountDetails, 
    updateUserAvatar, 
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory, 
};