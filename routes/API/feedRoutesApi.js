const express = require("express");

const feedController = require("../../controllers/API/feedController");
const authenticationMiddlewares = require("../../middlewares/authentication");

const router = express.Router();

router.get("/popular", feedController.getPopularVideos);
router.get("/channel/:channelHandel", feedController.getChannel);
router.get("/video/:videoId", feedController.getVideo);
router.get("/search", feedController.getSearch);
router.get(
  "/feed/liked",
  authenticationMiddlewares.requireLogin,
  feedController.getLikedVideos
);
router.get(
  "/feed/subscriptions",
  authenticationMiddlewares.requireLogin,
  feedController.getSubscriptions
);
router.post(
  "/like",
  authenticationMiddlewares.requireLogin,
  feedController.postLike
);

router.post(
  "/subscribe",
  authenticationMiddlewares.requireLogin,
  feedController.postSubscribe
);

module.exports = router;
