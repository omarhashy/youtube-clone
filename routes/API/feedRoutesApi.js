const express = require("express");

const feedController = require("../../controllers/API/feedController");
const router = express.Router();

router.get("/channel/:channelHandel", feedController.getChannel);
router.get("/video/:videoId", feedController.getVideo);
router.get("/search", feedController.getSearch);

module.exports = router;
