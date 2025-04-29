import { Router } from 'express';
import { getLikedVideos, toggleCommentLike, toggleVideoLike, toggleTweetLike } from "../controllers/like.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"

const router = Router();
// Apply verifyJWT middleware to all routes in this file
// This will ensure that all routes in this file require authentication
router.use(verifyJWT); 

router.route("/toggle/v/:videoId").post(toggleVideoLike);
router.route("/toggle/c/:commentId").post(toggleCommentLike);
router.route("/toggle/t/:tweetId").post(toggleTweetLike);
router.route("/videos").get(getLikedVideos);

export default router