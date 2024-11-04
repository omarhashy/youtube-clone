const express = require("express");
const youtubeController = require("../../controllers/webApp/youtubeController");
const router = express.Router();

router.get("/", youtubeController.index);

module.exports = router;
