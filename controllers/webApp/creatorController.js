const { validationResult } = require("express-validator");
const Video = require("../../models/video");
module.exports.getUploadVideo = (req, res, next) => {
  context = {
    pageTile: "Upload video",
    pageHeader: "Upload video",
    action: "/creator/upload-video",
    titleValue: "",
    descriptionValue: "",
  };
  res.render("creator/creator.ejs", context);
};

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
      console.log(errors);
      req.flash("errors", errors);
      res.redirect("/creator/upload-video");
      return;
    }

    await Video.create({
      thumbnailFile: thumbnailFile.filename,
      videoFile: videoFile.filename,
      title: req.body.title,
      description: req.body.description,
      channelId: req.channelId,
    });

    req.flash("successes", ["video uploaded successfully"]);
    return res.redirect(`/channel/${req.channelHandle}`);
  } catch (err) {
    next(err);
  }
};

module.exports.getEditVideo = async (req, res, next) => {
  try {
    const video = await Video.findByPk(req.params.videoId);

    if (!video) {
      req.flash("errors", ["no video found!"]);
      res.redirect("/");
      return;
    }

    if (req.channelId != video.channelId) {
      req.flash("errors", ["unauthorize access!"]);
      res.redirect("/");
      return;
    }

    context = {
      pageTile: "Edit video",
      pageHeader: "Edit video",
      action: `/creator/edit-video/${req.params.videoId}`,
      titleValue: video.title,
      descriptionValue: video.description,
    };

    return res.render("creator/creator.ejs", context);
  } catch (err) {
    console.error(err);
    next(err);
  }
};

module.exports.postEditVideo = async (req, res, next) => {
  try {
    const video = await Video.findByPk(req.params.videoId);

    if (!video) {
      req.flash("errors", ["no video found!"]);
      res.redirect("/");
      return;
    }

    if (req.channelId != video.channelId) {
      console.log(req.channelId, video.channelId);

      req.flash("errors", ["unauthorize access!"]);
      res.redirect("/");
      return;
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.flash(
        "errors",
        errors.array().map((i) => i.msg)
      );
      return res.redirect(`/creator/edit-video/${req.params.videoId}`);
    }

    video.title = req.body.title;
    video.description = req.body.description;

    video.save();
    req.flash("successes", ["Video updated successfully"]);
    return res.redirect("/");
    // return res.status(200).json([req.params, req.body, video]);
  } catch (err) {
    console.error(err);
    next(err);
  }
};
