const express = require("express");
const feedController = require("../../controllers/webApp/feedController");
const authenticationMiddlewares = require("../../middlewares/authentication");
const router = express.Router();

router.get("/", feedController.getIndex);
router.get(
  "/feed/subscriptions",
  authenticationMiddlewares.requireLogin,
  feedController.getSubscriptions
);
router.get(
  "/feed/liked",
  authenticationMiddlewares.requireLogin,
  feedController.getLiked
);
router.get("/channel/:channelHandel", feedController.getChannel);
router.get("/video/:videoId", feedController.getVideo);
router.get("/search", feedController.getSearch);
module.exports = router;
