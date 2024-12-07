const express = require("express");

const creatorController = require("../../controllers/API/creatorController");
const authenticationMiddlewares = require("../../middlewares/authentication");
const validators = require("../../validators/creator");

const router = express.Router();

router.post(
  "/upload-video",
  authenticationMiddlewares.requireLogin,
  validators.videoValidator,
  creatorController.postUploadVideo
);

router.patch(
  "/edit-video",
  authenticationMiddlewares.requireLogin,
  validators.videoValidator,
  creatorController.patchEditVideo
);

module.exports = router;
