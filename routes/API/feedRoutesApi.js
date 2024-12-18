const express = require("express");

const feedController = require("../../controllers/API/feedController");
const router = express.Router();

router.get("/channel/:channelHandel", feedController.getChannel);

module.exports = router;
