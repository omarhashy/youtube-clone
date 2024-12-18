const Video = require("../../models/video");
const Channel = require("../../models/channel");

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

    const limit = 2;
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
        rest.thumbnailUrl = `/files/images/${video.thumbnailFile}`;
        return rest;
      }),
    };
    return res.json(context);
  } catch (err) {
    next(err);
  }
};
