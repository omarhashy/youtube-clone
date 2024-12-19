const Video = require("../../models/video");
const Channel = require("../../models/channel");
const { Op } = require("sequelize");
const videosFilter = require("../../utilities/videosFilter");

exports.getChannel = async (req, res, next) => {
  try {
    const page = req.query.page ?? 1;

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
    const videos = await Video.findAll({
      where: { channelId: channel.id },
      limit: limit,
      offset: (page - 1) * limit,
      order: [["createdAt", "DESC"]],
    });

    context = {
      pageTile: channelHandel,
      channelInfo: (() => {
        const {
          id,
          verified,
          password,
          email,
          channelPictureFile,
          createdAt,
          updatedAt,
          ...rest
        } = channel.dataValues;
        rest.channelPictureUrl = `/files/images/${channel.channelPictureFile}`;
        return rest;
      })(),
      videoArray: videos.map((video) => {
        const {
          verified,
          id,
          videoFile,
          updatedAt,
          channelId,
          thumbnailFile,
          ...rest
        } = video.dataValues;
        rest.videoUrl = `/video/${video.id}`;
        rest.thumbnailUrl = `/files/images/${video.thumbnailFile}`;
        return rest;
      }),
    };
    return res.json(context);
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
      title: video.title,
      description: video.description,
      likesCounter: video.likesCounter,
      commentsCounter: video.commentsCounter,
      createdAt: video.createdAt,
      channelName: channel.name,
      channelPictureURL: `/files/images/${channel.channelPictureFile}`,
      channelUrl: `/channel/${channel.handle}`,
      videoThumbnailUrl: `/files/images/${video.thumbnailFile}`,
      videoUrl: `/files/videos/${video.videoFile}`,
    };

    return res.status(200).json(context);
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
    if (!videos.length) {
      return next();
    }
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
