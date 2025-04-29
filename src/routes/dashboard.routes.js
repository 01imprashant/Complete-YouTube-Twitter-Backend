import { Router } from 'express';
import { getChannelStats, getChannelVideos } from "../controllers/dashboard.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"

const router = Router();

// Apply verifyJWT middleware to all routes in this file
// This will ensure that all routes in this file require authentication
router.use(verifyJWT);

router.route("/stats").get(getChannelStats);
router.route("/videos").get(getChannelVideos);

export default router