const { format } = require("date-fns");
const Channel = require("../models/channel");

module.exports = async (video, addChannelInfo = false) => {
  const { videoFile, updatedAt, channelId, thumbnailFile, ...rest } =
    video.dataValues;
  rest.thumbnailUrl = `/files/images/${video.thumbnailFile}`;
  rest.createdAt = format(rest.createdAt, "dd/MM/yyyy hh:mma");
  rest.videoUrl = `/video/${video.id}`;
  if (addChannelInfo) {
    const channel = await Channel.findByPk(video.channelId);
    const {
      id,
      password,
      email,
      channelPictureFile,
      createdAt,
      updatedAt,
      verified,
      ...channelRest
    } = channel.dataValues;
    channelRest.channelPictureUrl = `/files/images/${channel.channelPictureFile}`;
    rest.channelInfo = channelRest;
  }

  return rest;
};
