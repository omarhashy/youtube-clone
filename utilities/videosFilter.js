const { format } = require("date-fns");

module.exports = videosFilter = (video) => {
  const { id, videoFile, updatedAt, channelId, thumbnailFile, ...rest } =
    video.dataValues;
  rest.thumbnailUrl = `/files/images/${video.thumbnailFile}`;
  rest.createdAt = format(rest.createdAt, "dd/MM/yyyy hh:mma");
  rest.videoUrl = `/video/${video.id}`;
  return rest;
};
