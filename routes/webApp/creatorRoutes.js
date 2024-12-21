const express = require("express");

const creatorController = require("../../controllers/webApp/creatorController");
const authenticationMiddlewares = require("../../middlewares/authentication");
const validators = require("../../validators/creator");

const router = express.Router();

router.get(
  "/upload-video",
  authenticationMiddlewares.requireLogin,
  creatorController.getUploadVideo
);

router.post(
  "/upload-video",
  authenticationMiddlewares.requireLogin,
  validators.videoValidator,
  creatorController.postUploadVideo
);

router.get(
  "/edit-video/:videoId",
  authenticationMiddlewares.requireLogin,
  creatorController.getEditVideo
);

router.post(
  "/edit-video/:videoId",
  authenticationMiddlewares.requireLogin,
  validators.videoValidator,
  creatorController.postEditVideo
);

router.post(
  "/delete-video/:videoId",
  authenticationMiddlewares.requireLogin,
  creatorController.postDeleteVideo
);

module.exports = router;
