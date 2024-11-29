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

router.post("/upload-video", authenticationMiddlewares.requireLogin);

module.exports = router;
