import mongoose, {isValidObjectId, set} from "mongoose"
import { Playlist } from "../models/playlist.model.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body;
    //TODO: create playlist
    if(!name || !description){
        throw new ApiError(400, "Name and Description are reuired")
    }
    const existingPlaylist = await Playlist.findOne({
        name,
        owner: req.user?._id,
    })
    if(existingPlaylist){
        throw new ApiError(400, "Playlist already exist with same name")
    }
    const playlist = await Playlist.create({
        name,
        description,
        owner: req.user?._id,
    })
    if(!playlist){
        throw new ApiError(400, "Error while creating playlist")
    }
    return res
    .status(201)
    .json(new ApiResponse(200, playlist, "Plalist created Successfully"))

})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params;
    //TODO: get user playlists
    if(!userId || !isValidObjectId(userId)){
        throw new ApiError(400, "Invalid userId")
    }
    const userplaylists = await Playlist.aggregate([
        //match the owner's all playlists
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        // lookup for getting owner's details
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "createdBy",
                pipeline: [
                    {
                        $project:{
                            username: 1,
                            fullName: 1,
                            avatar: 1,
                        }
                    }
                ]
            }
        },
        // converting the createdBy array into an object
        {
            $addFields: {
                createdby:{
                    $arrayElemAt:["$createdBy",0],
                }
            }
        },
        // this lookup is for videos
        {
            $lookup: {
                from: "videos",
                localField: "videos",
                foreignField: "_id",
                as: "videos",
                pipeline: [
                    // further lookup to get the owner details of the video
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
                                        fullName: 1,
                                        avatar: 1,
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            owner: {
                            $arrayElemAt: ["$owner", 0],
                            }
                        }
                    },
                    // this is the projection for the video level
                    {
                        $project: {
                            title: 1,
                            description: 1,
                            thumbnail: 1,
                            owner: 1
                        }
                    }
                ]
            }
        },
        // this projection is outside at the playlist level for the final result
        {
          $project: {
            videos: 1,
            createdBy: 1,
            name: 1,
            description: 1
          }
        }
    ])
    // console.log("userplaylist:", userplaylists)
    if(!userplaylists){
        throw new ApiError(404, "Playlist Not Found")
    }
    // return response
    return res
    .status(200)
    .json(new ApiResponse(200,userplaylists, "Playlist fetched successfully"))
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    //TODO: get playlist by id
    if(!playlistId || !isValidObjectId(playlistId)){
        throw new ApiError(400, "Invalid playlistId")
    }

    const playlistById = await Playlist.aggregate([
        //match the owner's all playlists
        {
          $match: {
            _id: new mongoose.Types.ObjectId(playlistId),
          }
        },
        // lookup for getting owner's details
        {
          $lookup: {
            from: "users",
            localField: "owner",
            foreignField: "_id",
            as: "createdBy",
            pipeline: [
              // projecting user details
              {
                $project: {
                  username: 1,
                  fullname: 1,
                  avatar: 1,
                }
              }
            ]
          }
        },
        // converting the createdBy array to an object
        {
          $addFields: {
            createdBy: {
              $arrayElemAt: ["$createdBy", 0],
            }
          }
        },
        // this lookup if for videos
        {
          $lookup: {
            from: "videos",
            localField: "videos",
            foreignField: "_id",
            as: "videos",
            pipeline: [
              // further lookup to get the owner details of the video
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
                        avatar: 1,
                      }
                    }
                  ]
                }
              },
              {
                $addFields: {
                  owner: {
                    $arrayElemAt: ["$owner", 0],
                  }
                }
              },
              // this is the projection for the video level
              {
                $project: {
                  title: 1,
                  description: 1,
                  thumbnail: 1,
                  owner: 1,
                  duration: 1,
                  views: 1,
                  createdAt: 1,
                  updatedAt: 1
                }
              }
            ]
          }
        },
        // this projection is outside at the playlist level for the final result
        {
          $project: {
            videos: 1,
            createdBy: 1,
            name: 1,
            description: 1,
          }
        }
    ])

    console.log("Playlist: ", playlistById)
    if(!playlistById){
        throw new ApiError(404, "Playlist Not Found")
    }
    // return response
    return res
    .status(200)
    .json(new ApiResponse(200,playlistById,"Playlist fetched successfully"))
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    // get playlistId and videoId from frontend
    const { playlistId, videoId } = req.params;
    // TODO: add video to playlist
    // check palylistId is valid or not
    if(!playlistId || !isValidObjectId(playlistId)){
      throw new ApiError(400, "Invalid PlaylistId")
    }
    // check videoId is valid or not
    if(!videoId || !isValidObjectId(videoId)){
      throw new ApiError(400, "Invalid VideoId")
    }
    // find playlist using playlistId
    const playlist = await Playlist.findById(playlistId)
    if(!playlist){
      throw new ApiError(404, "no such playlist exists")
    }
    // check playlist owner is same as user
    if(!playlist.owner.equals(req.user?._id)){
      throw new ApiError(403, "You are not allowed to modify playlist")
    }
    // check playlist if video already exixts
    if(playlist.videos.includes(videoId)){
      throw new ApiError(400, "Video already exists in the playlist")
    }
    // add video to playlist
    const addVideoToPlaylist = await Playlist.findByIdAndUpdate(
      playlistId,
      {
        $push:{
          videos: videoId
        }
      },
      {
        new: true,
        runValidators: true,
      }
    )
    // console.log("UpdatedPlaylist:",updatePlaylist)
    // check video add successfully or nor
    if(!addVideoToPlaylist){
      throw new ApiError(400, "Error while adding video to playlist")
    }
    // return response
    return res
    .status(200)
    .json(new ApiResponse(200, addVideoToPlaylist, "Video added to playlist successfully"))

})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    // get playlistId and videoId from frontend 
    const { playlistId, videoId } = req.params;
    // TODO: remove video from playlist
    // check playlistId is valid or not
    if(!playlistId || !isValidObjectId(playlistId)){
      throw new ApiError(400, "Invalid PlaylistId")
    }
    // check videoId is valid or not
    if(!videoId || !isValidObjectId(videoId)){
      throw new ApiError(400, "invalid videoId")
    }
    // find playlist using playlistId
    const playlist = await Playlist.findById(playlistId)
    // check playlist is valid or not
    if(!playlist){
      throw new ApiError(400, "No such playlist exists")
    }
    // check playlist owner is same as user
    if(!playlist.owner.equals(req.user?._id)){
      throw new ApiError(403, "You are not allowed to modify playlist")
    }
    // remove video from playlist
    const removeVideoFromPlaylist = await Playlist.findByIdAndUpdate(
      playlistId,
      {
        $pull: {
          videos: videoId,
        }
      },
      {
        new: true,
        runValidators: true,
      }
    )

    // console.log("UpdatedPlaylist: ", updatePlaylist)
    // check video removed successfully
    if(!removeVideoFromPlaylist){
      throw new ApiError(400, "Error while removing video from playlist")
    }
    // return response
    return res
    .status(200)
    .json(new ApiResponse(200, removeVideoFromPlaylist, "Video removed from playlist successfully"))

})

const deletePlaylist = asyncHandler(async (req, res) => {
    // get playlistId from frontend
    const {playlistId} = req.params;
    // TODO: delete playlist
    // check playlistId
    if(!playlistId || !isValidObjectId(playlistId)){
      throw new ApiError(400, "Invalid PlaylistId")
    }
    // find playlist using playlistId
    const playlist = await Playlist.findById(playlistId)
    // check playlist is valid or not
    if(!playlist){
      throw new ApiError(400, "No such playlist exists")
    }
    // check playlist owner is same as user
    if(!playlist.owner.equals(req.user?._id)){
      throw new ApiError(403, "You are not allowed to delete playlist")
    }
    // delete particular playlist from playlist schema using playlistId
    const deletePlaylist = await Playlist.findByIdAndDelete(playlist._id)
    // check playlist deleted successfully or not
    if(!deletePlaylist){
      throw new ApiError(400, "Error while deleting playlist")
    }
    //return response
    return res
    .status(200)
    .json(new ApiResponse(200, deletePlaylist, "playlist deleted successfully"))

})

const updatePlaylist = asyncHandler(async (req, res) => {
    // get playlistid from frontend
    const { playlistId } = req.params;
    // get name and description from frontend
    const { name, description } = req.body;
    //TODO: update playlist
    // check playlistid is valid or not
    if(!playlistId || !isValidObjectId(playlistId)){
      throw new ApiError(400, "Invalid PlaylistId")
    }
    // check for name and description
    if(!name || !description){
      throw new ApiError(400, "Name and Description are required")
    }
    // find playlist using playlistId
    const playlist = await Playlist.findById(playlistId)
    // check playlist is valid or not
    if(!playlist){
      throw new ApiError(400, "No such playlist exists")
    }
    // check playlist owner is same as user
    if(!playlist.owner.equals(req.user?._id)){
      throw new ApiError(403, "You are not allowed to update playlist")
    }
    //
    const updatePlaylist = await Playlist.findByIdAndUpdate(
      playlist?._id,
      {
        $set: {
          name,
          description,
        }
      },
      {
        new: true,
        runValidators: true,
      }
    )
    // check playlist updated successfully or not
    if(!updatePlaylist){
      throw new ApiError(400, "Error while updating playlist")
    }
    // return response
    return res
    .status(200)
    .json(new ApiResponse(200, updatePlaylist, "Playlist updated successfully"))
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}