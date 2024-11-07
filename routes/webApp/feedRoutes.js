const express = require("express");
const feedController = require("../../controllers/webApp/feedController");
const router = express.Router();

router.get("/", feedController.getIndex);
router.get("/feed/subscriptions", feedController.getSubscriptions);
router.get("/feed/liked", feedController.getLiked);

router.get("/channel/:channelHandel", feedController.getChannel);
router.get("/video/:videoId", feedController.getVideo);

module.exports = router;
