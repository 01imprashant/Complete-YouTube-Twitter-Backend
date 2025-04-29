import mongoose, { isValidObjectId } from "mongoose"
import { Comment } from "../models/comment.model.js"
import { Video } from "../models/video.model.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    // check videoId is valid or not
    if(!videoId || !isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid VideoId")
    }
    // find video using videoId
    const video = await Video.findById(videoId)
    // check video 
    if(!video){
        throw new ApiError(400, "No such video exists")
    }
    const comments = await Comment.aggregate([
        {
            $match: {
                video: new mongoose.Types.ObjectId(videoId)
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
                            username: 1,
                            fullName: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                createdBy: { 
                    $arrayElemAt: ["$createdBy", 0]
                }
            }
        },
        {
            $unwind : "$createdBy"
        },
        {
            $project: {
                content: 1,
                createdAt: 1,
            }
        },
        {
            $skip: (page - 1) * limit
        },
        {
            $limit: parseInt(limit)
        }
    ])
    // returen response
    return res
    .status(200)
    .json(new ApiResponse(200, comments, "Comments fetched successfully"))

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const { videoId } = req.params;
    const { content } = req.body;
    // check videoId is valid or not
    if(!videoId || !isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid VideoId")
    }
    // find user using userId
    const userId = req.user.id;
    // find video using videoId
    const video = await Video.findById(videoId);
    // check video
    if(!video){
        throw new ApiError(400, "No such video exists");
    }
    // add new comment
    const newComment = await Comment.create({
        content,
        video: videoId,
        owner: userId
    });
    // check new comment is created or not
    if(!newComment){
        throw new ApiError(400, "Error while adding new comment");
    }
    // return response
    return res
    .status(201)
    .json(new ApiResponse(201, newComment, "Comment added successfully"));
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const { commentId } = req.params;
    const { content } = req.body;
    // check commentId is valid or not
    if(!commentId || !isValidObjectId(commentId)){
        throw new ApiError(400, "Invalid CommentId")
    }
    // check content is valid or not
    if(!content){
        throw new ApiError(400, "Content is required")
    }
    // find user using userId
    const userId = req.user.id;
    // find comment using commentId
    const comment = await Comment.findById(commentId);
    // check comment
    if(!comment){
        throw new ApiError(400, "No such comment exists");
    }
    // check if user is owner of the comment
    if(comment.owner.toString() !== userId){
        throw new ApiError(403, "You are not allowed to update this comment");
    }
    // update comment
    const updatedComment = await Comment.findByIdAndUpdate(
        commentId,
        { content },
        { new: true }
    );
    // check updated comment is created or not
    if(!updatedComment){
        throw new ApiError(400, "Error while updating comment");
    }
    // return response
    return res
    .status(200)
    .json(new ApiResponse(200, updatedComment, "Comment updated successfully"));

})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const { commentId } = req.params;
    // check commentId is valid or not
    if(!commentId || !isValidObjectId(commentId)){
        throw new ApiError(400, "Invalid CommentId")
    }
    // find user using userId
    const userId = req.user.id;
    // find comment using commentId
    const comment = await Comment.findById(commentId);
    // check comment
    if(!comment){
        throw new ApiError(400, "No such comment exists");
    }
    // check if user is owner of the comment
    if(comment.owner.toString() !== userId){
        throw new ApiError(403, "You are not allowed to delete this comment");
    }
    // delete comment
    const deletedComment = await Comment.findByIdAndDelete(commentId);
    // check deleted comment is created or not
    if(!deletedComment){
        throw new ApiError(400, "Error while deleting comment");
    }
    // return response
    return res
    .status(200)
    .json(new ApiResponse(200, deletedComment, "Comment deleted successfully"));

})

export {
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment
}