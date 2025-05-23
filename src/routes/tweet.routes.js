import { Router } from 'express';
import { createTweet, deleteTweet, getUserTweets, updateTweet } from "../controllers/tweet.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"

const router = Router();
// Apply verifyJWT middleware to all routes in this file
// This will ensure that all routes in this file require authentication
router.use(verifyJWT); 
router.route("/").post(createTweet);
router.route("/user/:userId").get(getUserTweets);
router.route("/:tweetId").patch(updateTweet).delete(deleteTweet);

export default router