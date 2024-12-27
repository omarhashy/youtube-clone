const Video = require("../../models/video");
const Channel = require("../../models/channel");
const sequelize = require("../../config/database");
const Like = require("../../models/like");
const { Op } = require("sequelize");
const videosFilter = require("../../utilities/videosFilter");
const Subscription = require("../../models/subscription");
const Comment = require("../../models/comment");
const IO = require("../../socket");

exports.getPopularVideos = async (req, res, next) => {
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
    };
    res.status(200).json(context);
  } catch (err) {
    next(err);
  }
};

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
      order: [
        [sequelize.literal('"likesCounter" + "commentsCounter"'), "DESC"],
      ],
    });

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
    if (!videoId) {
      return res.status(400).json({ message: "invalid request" });
    }
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
      await Promise.all([
        like.destroy({ transaction: t }),
        video.save({ transaction: t }),
      ]);
      await t.commit();

      return res.status(201).json({
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

    await Promise.all([like, video.save({ transaction: t })]);
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

exports.postSubscribe = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    if (
      !req.body.channelHandel ||
      req.body.channelHandel === req.channelHandel
    ) {
      return res.status(400).json({ message: "invalid request" });
    }
    const channelHandle = req.body.channelHandel;
    const channel = await Channel.findOne({
      where: {
        handle: channelHandle,
      },
    });
    if (!channel || !channel.verified) {
      return res.status(400).json({ message: "invalid request" });
    }

    let subscription = await Subscription.findOne({
      where: {
        subscriber: req.channelId,
        subscribed: channel.id,
      },
    });
    if (subscription) {
      channel.subscribersCounter--;
      await Promise.all([
        channel.save({ transaction: t }),
        subscription.destroy({ transaction: t }),
      ]);
      await t.commit();
      return res.status(201).json({
        message: "subscription removed successfully",
        subscriber: req.channelHandle,
        subscribed: channelHandle,
        isSubscribed: false,
      });
    }
    subscription = Subscription.create(
      {
        subscriber: req.channelId,
        subscribed: channel.id,
      },
      { transaction: t }
    );
    channel.subscribersCounter++;
    await Promise.all([subscription, channel.save({ transaction: t })]);
    await t.commit();
    return res.status(200).json({
      message: "subscription added successfully",
      subscriber: req.channelHandle,
      subscribed: channelHandle,
      isSubscribed: true,
      subscribersCounter: channel.subscribersCounter,
    });
  } catch (err) {
    await t.rollback();
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
    context = {
      videoArray: await Promise.all(
        videos.map((video) => videosFilter(video, true))
      ),
    };
    return res.status(200).json(context);
  } catch (err) {
    next(err);
  }
};

exports.postComment = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const videoId = req.body.videoId;
    const commentContent = req.body.comment.trim();
    if (commentContent === "") {
      const error = new Error("comment can't be empty");
      error.status = 400;
      throw error;
    }
    if (!videoId || !commentContent) {
      return res.status(400).json({ message: "invalid request" });
    }
    const video = await Video.findByPk(videoId);
    if (!video) {
      next();
      return;
    }
    video.commentsCounter++;
    const comment = Comment.create(
      {
        content: commentContent,
        videoId: videoId,
        channelId: req.channelId,
      },
      { transaction: t }
    );
    await Promise.all([comment, video.save({ transaction: t })]);
    await t.commit();

    const context = {
      message: "comment added successfully",
      comment: await (async () => {
        const channel = await Channel.findByPk((await comment).channelId, {
          attributes: ["name", "handle", "channelPictureFile"],
        });
        const { channelId, updatedAt, ...rest } = (await comment).dataValues;
        // console.log(comment.channelId);

        const { channelPictureFile, ...channelInfo } = channel.dataValues;
        rest.channelInfo = channelInfo;
        rest.channelInfo.channelPictureUrl = `/files/images/${channel.channelPictureFile}`;
        return rest;
      })(),
    };

    const io = IO.getIO();
    io.in(`Room${videoId}`).emit("commentAdded", context);

    return res.status(200).json(context);
  } catch (error) {
    next(error);
  }
};

exports.getComments = async (req, res, next) => {
  try {
    const videoId = req.params.videoId;
    const page = +req.query.page || 1;
    const limit = 5;
    const comments = await Comment.findAll({
      where: {
        videoId: videoId,
      },
      limit: limit,
      offset: (page - 1) * limit,
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: Channel,
          attributes: ["name", "handle", "channelPictureFile"],
        },
      ],
    });

    return res.status(200).json({
      comments: comments.map((comment) => {
        // return comment
        const { channel, updatedAt, ...rest } = comment.dataValues;
        const { channelPictureFile, ...channelInfo } = channel.dataValues;
        rest.channelInfo = channelInfo;
        rest.channelInfo.channelPictureUrl = `/files/images/${channel.channelPictureFile}`;

        return rest;
      }),
    });
  } catch (error) {
    next(error);
  }
};
