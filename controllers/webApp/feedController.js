const Video = require("../../models/video");
const Channel = require("../../models/channel");
const Like = require("../../models/like");
const Subscription = require("../../models/subscription");
const { format } = require("date-fns");
const { Op } = require("sequelize");
const videosFilter = require("../../utilities/videosFilter");
const sequelize = require("../../config/database");

exports.getIndex = async (req, res, next) => {
  try {
    const videos = await Video.findAll({
      limit: 10,
      order: [
        [sequelize.literal('"likesCounter" + "commentsCounter"'), "DESC"],
      ],
    });
    context = {
      pageTile: "Home",
      PageHeader: "Popular videos",
      videoArray: await Promise.all(
        videos.map((video) => videosFilter(video, true))
      ),
      previousPage: false,
      nextPage: false,
    };
    res.status(200).render("feed/video-list.ejs", context);
  } catch (err) {
    next(err);
  }
};

exports.getSubscriptions = async (req, res, next) => {
  try {
    const page = +req.query.page || 1;
    const limit = 10;

    let subscriptions = await Subscription.findAll({
      where: {
        subscriber: req.channelId,
      },
      attributes: ["subscribed"],
    });

    subscriptions = subscriptions.map((sub) => sub.subscribed);

    const videos = await Video.findAll({
      where: {
        channelId: { [Op.in]: subscriptions },
      },
      limit: limit,
      offset: (page - 1) * limit,
      order: [["createdAt", "DESC"]],
    });

    const rows = await Video.count({
      where: {
        channelId: { [Op.in]: subscriptions },
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

    const context = {
      currentPage: page,
      previousPage: previousPage,
      nextPage: nextPage,
      pageTile: "Subscriptions",
      PageHeader: "Subscriptions",
      videoArray: await Promise.all(
        videos.map((video) => videosFilter(video, true))
      ),
    };

    return res.status(200).render("feed/video-list.ejs", context);
  } catch (err) {
    next(err);
  }
};

exports.getLiked = async (req, res, next) => {
  try {
    const page = +req.query.page || 1;
    const limit = 10;
    const likes = await Like.findAll({
      where: {
        channelId: req.channelId,
      },
      limit: limit,
      offset: (page - 1) * limit,
      order: [["createdAt", "DESC"]],
    });

    const videos = await Promise.all(
      likes.map(async (like) => {
        const video = await Video.findByPk(like.videoId);
        return video;
      })
    );

    const rows = await Like.count({
      where: {
        channelId: req.channelId,
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
    const context = {
      currentPage: page,
      previousPage: previousPage,
      nextPage: nextPage,
      pageTile: "Liked",
      PageHeader: "Liked Videos",
      videoArray: await Promise.all(
        videos.map((video) => videosFilter(video, true))
      ),
    };

    return res.status(200).render("feed/video-list.ejs", context);
  } catch (err) {
    next(err);
  }
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

    const limit = 10;

    const rows = await Video.count({
      where: {
        channelId: channel.id,
      },
    });

    const videos = await Video.findAll({
      where: { channelId: channel.id },
      limit: limit,
      offset: (page - 1) * limit,
      order: [["createdAt", "DESC"]],
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
      videoArray: await Promise.all(videos.map(videosFilter)),
    };
    context.myChannel = req.channelId == channel.id;
    context.isLoggedIn = req.isLoggedIn;

    if (!context.myChannel && req.isLoggedIn) {
      context.isSubscribed = false;
      const subscription = await Subscription.findOne({
        where: {
          subscriber: req.channelId,
          subscribed: channel.id,
        },
      });
      if (subscription) {
        context.isSubscribed = true;
      }
    }
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
      videoId: video.id,
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
      isLiked: false,
    };

    if (req.isLoggedIn) {
      let like = await Like.findOne({
        where: {
          channelId: req.channelId,
          videoId: videoId,
        },
      });
      if (like) {
        context.isLiked = true;
      }
    }
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
    const limit = 10;

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

    const rows = await Video.count({
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
    });

    const context = {
      previousPage: false,
      nextPage: false,
      search: true,
      currentPage: page,
      query: query,
      videoArray: await Promise.all(
        videos.map((video) => videosFilter(video, true))
      ),
      page: page,
      pageTile: `Search`,
      PageHeader: `Search results for "${query}"`,
    };

    if (limit * page < rows) {
      context.nextPage = page + 1 + "&query=" + query;
    }
    if (page > 1) {
      context.previousPage = page - 1 + "&query=" + query;
    }

    return res.render("feed/video-list.ejs", context);
  } catch (err) {
    next(err);
  }
};
