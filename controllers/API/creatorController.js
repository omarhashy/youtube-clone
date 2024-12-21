const { validationResult } = require("express-validator");
const Video = require("../../models/video");

module.exports.postUploadVideo = async (req, res, next) => {
  try {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      errors = errors.array().map((i) => i.msg);
    } else {
      errors = [];
    }
    const thumbnailFile = req.files.thumbnail ? req.files.thumbnail[0] : null;
    const videoFile = req.files.video ? req.files.video[0] : null;
    if (!thumbnailFile || !videoFile) {
      errors.push("thumbnail and video can not be empty");
    }

    if (errors.length) {
      const error = new Error();
      error.statusCode = 403;
      error.data = errors;
      throw error;
    }

    const video = await Video.create({
      thumbnailFile: thumbnailFile.filename,
      videoFile: videoFile.filename,
      title: req.body.title,
      description: req.body.description,
      channelId: req.channelId,
    });

    return res
      .status(201)
      .json({ message: "video uploaded successfully", video: video });
  } catch (err) {
    next(err);
  }
};

module.exports.patchEditVideo = async (req, res, next) => {
  try {
    const video = await Video.findByPk(req.body.videoId);

    if (!video) {
      const error = new Error("No video found");
      error.statusCode = 403;
      throw error;
    }

    if (req.channelId != video.channelId) {
      const error = new Error("unauthorize access!");
      error.statusCode = 401;
      throw error;
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error("validation error");
      error.statusCode = 403;
      error.data = errors.array().map((i) => i.msg);
      throw error;
    }

    video.title = req.body.title;
    video.description = req.body.description;

    await video.save();

    return res.status(200).json({ message: "Video updated successfully" });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

module.exports.deleteDeleteVideo = async (req, res, next) => {
  try {
    const videoId = req.params.videoId;
    const video = await Video.findByPk(videoId);
    if (req.channelId != video.channelId) {
      const error = new Error("unauthorize access access");
      error.statusCode = 401;
      throw error;
    }

    await video.destroy();
    return res.json({ message: "Video deleted successfully" });
  } catch (err) {
    next(err);
  }
};
