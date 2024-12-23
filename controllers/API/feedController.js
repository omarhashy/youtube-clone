const Video = require("../../models/video");
const Channel = require("../../models/channel");
const sequelize = require("../../config/database");
const Like = require("../../models/like");
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
      videoId: video.id,
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
      videoArray: await Promise.all(
        videos.map((video) => videosFilter(video, true))
      ),
      page: page,
    };

    return res.status(200).json(context);
  } catch (err) {
    next(err);
  }
};

exports.postLike = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const videoId = req.body.videoId;
    const video = await Video.findByPk(videoId);

    if (!video) {
      next();
      return;
    }

    let like = await Like.findOne({
      where: {
        channelId: req.channelId,
        videoId: videoId,
      },
    });

    if (like) {
      video.likesCounter--;
      await like.destroy({ transaction: t });
      await video.save({ transaction: t });
      await t.commit();
      return res.status(200).json({
        likesCounter: video.likesCounter,
        channelId: req.channelId,
        videoId: video.id,
        message: "like removed successfully",
        isLiked: false,
      });
    }

    video.likesCounter++;

    like = Like.create(
      {
        videoId: video.id,
        channelId: req.channelId,
      },
      { transaction: t }
    );
    const videoP = video.save({ transaction: t });

    await Promise.all([like, videoP]);
    await t.commit();
    return res.status(200).json({
      likesCounter: video.likesCounter,
      channelId: req.channelId,
      videoId: video.id,
      message: "like added successfully",
      isLiked: true,
    });
  } catch (err) {
    await t.rollback();
    next(err);
  }
};

module.exports.getLikedVideos = async (req, res, next) => {
  try {
    const page = req.query.page ?? 1;
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

    const context = {
      videoArray: await Promise.all(
        videos.map((video) => videosFilter(video, true))
      ),
    };

    return res.status(200).json(context);
  } catch (err) {
    next(err);
  }
};
