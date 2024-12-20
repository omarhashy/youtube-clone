const Video = require("../../models/video");
const Channel = require("../../models/channel");
const { format } = require("date-fns");
const { Op } = require("sequelize");
const videosFilter = require("../../utilities/videosFilter");

exports.getIndex = (req, res, next) => {
  context = {
    pageTile: "Home",
    PageHeader: "Popular videos",
  };
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

exports.getChannel = async (req, res, next) => {
  try {
    const page = +req.query.page || 1;

    const channelHandel = req.params.channelHandel;
    const channel = await Channel.findOne({
      where: {
        handle: channelHandel,
      },
    });

    if (!channel || !channel?.verified) {
      next();
      return;
    }

    const limit = 1;
    const videos = await Video.findAll({
      where: { channelId: channel.id },
      limit: limit,
      offset: (page - 1) * limit,
      order: [["createdAt", "DESC"]],
    });

    if (!videos.length) {
      next();
      return;
    }
    const rows = await Video.count({
      where: {
        channelId: channel.id,
      },
    });
    let nextPage;
    let previousPage;
    if (limit * page < rows) {
      nextPage = page + 1;
    }
    if (page > 1) {
      previousPage = page - 1;
    }
    context = {
      currentPage: page,
      previousPage: previousPage,
      nextPage: nextPage,
      pageTile: channelHandel,
      channelInfo: (() => {
        const {
          id,
          password,
          email,
          channelPictureFile,
          createdAt,
          updatedAt,
          verified,
          ...rest
        } = channel.dataValues;
        rest.channelPictureUrl = `/files/images/${channel.channelPictureFile}`;
        return rest;
      })(),
      videoArray: videos.map(videosFilter),
    };
    context.myChannel = req.channelId == channel.id;
    return res.status(200).render("feed/channel.ejs", context);
  } catch (err) {
    next(err);
  }
};

exports.getVideo = async (req, res, next) => {
  try {
    const videoId = req.params.videoId;
    const video = await Video.findByPk(videoId);
    if (!video) {
      next();
      return;
    }
    const channel = await Channel.findByPk(video.channelId);
    const context = {
      pageTile: video.title,
      title: video.title,
      description: video.description,
      likesCounter: video.likesCounter,
      commentsCounter: video.commentsCounter,
      createdAt: format(video.createdAt, "dd/MM/yyyy hh:mma"),
      channelName: channel.name,
      channelPictureURL: `/files/images/${channel.channelPictureFile}`,
      channelUrl: `/channel/${channel.handle}`,
      videoThumbnailUrl: `/files/images/${video.thumbnailFile}`,
      videoUrl: `/files/videos/${video.videoFile}`,
    };

    res.render("feed/video.ejs", context);
  } catch (err) {
    next(err);
  }
};

exports.getSearch = async (req, res, next) => {
  try {
    const query = req.query.query;
    const page = +req.query.page || 1;

    if (!query) {
      return next();
    }
    const limit = 1;

    const videos = await Video.findAll({
      where: {
        [Op.or]: {
          title: {
            [Op.like]: `%${query}%`,
          },
          description: {
            [Op.like]: `%${query}%`,
          },
        },
      },
      limit: limit,
      offset: (page - 1) * limit,
      order: [["createdAt", "DESC"]],
    });
    const context = {
      query: query,
      videoArray: videos.map(videosFilter),
      page: page,
    };

    return res.status(200).json(context);
  } catch (err) {
    next(err);
  }
};
