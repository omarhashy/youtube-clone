const Video = require("../../models/video");
const Channel = require("../../models/channel");
const { format } = require("date-fns");

exports.getIndex = (req, res, next) => {
  context = {
    pageTile: "Home",
    PageHeader: "Popular videos",
  };
  // console.log(req.isLoggedIn);
  res.status(200).render("feed/home.ejs", context);
};

exports.getSubscriptions = (req, res, next) => {
  context = {
    pageTile: "Subscriptions",
    PageHeader: "Subscriptions",
  };
  res.status(200).render("feed/home.ejs", context);
};

exports.getLiked = (req, res, next) => {
  context = {
    pageTile: "Liked",
    PageHeader: "Liked videos",
  };
  res.status(200).render("feed/home.ejs", context);
};

exports.getChannel = (req, res, next) => {
  const channelHandel = req.params.channelHandel;
  context = {
    pageTile: channelHandel,
  };
  res.status(200).render("feed/channel.ejs", context);
};

exports.getVideo = async (req, res, next) => {
  const videoId = req.params.videoId;
  const video = await Video.findByPk(videoId);
  const channel = await Channel.findByPk(video.channelId);
  if (!video) {
    next();
    return;
  }
  
  const context = {
    pageTile: video.title,
    title: video.title,
    description: video.description,
    likesCounter: video.likesCounter,
    commentsCounter: video.commentsCounter,
    createdAt: format(video.createdAt, "dd/MM/yyyy hh:mma"),
    channelName: channel.name,
    channelPictureURL: `/files/images/${channel.channelPictureFile}`,
    videoThumbnailUrl: `/files/images/${video.thumbnailFile}`,
    videoUrl: `/files/videos/${video.videoFile}`,
  };
  
  // return res.json(context);
  res.render("feed/video.ejs", context);
};
