import { Router } from 'express';
import { addVideoToPlaylist, createPlaylist, deletePlaylist, getPlaylistById, getUserPlaylists,removeVideoFromPlaylist, updatePlaylist } from "../controllers/playlist.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"

const router = Router();

// Apply verifyJWT middleware to all routes in this file
// This will ensure that all routes in this file require authentication
router.use(verifyJWT); 

router.route("/").post(createPlaylist)
router.route("/:playlistId").get(getPlaylistById).patch(updatePlaylist).delete(deletePlaylist);
router.route("/add/:videoId/:playlistId").patch(addVideoToPlaylist);
router.route("/remove/:videoId/:playlistId").patch(removeVideoFromPlaylist);
router.route("/user/:userId").get(getUserPlaylists);

export default router