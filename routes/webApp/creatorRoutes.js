const express = require("express");

const creatorController = require("../../controllers/webApp/creatorController");
const authenticationMiddlewares = require("../../middlewares/authentication");

const router = express.Router();

router.get(
  "/upload-video",
  authenticationMiddlewares.requireLogin,
  creatorController.getUploadVideo
);

module.exports = router;
