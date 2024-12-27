const openSocket = (videoId) => {
  const socket = io({
    query: {
      videoId: videoId,
    },
  });

  socket.on("commentAdded", (data) => {
    console.log(data);
    appendComments(data.comment, "afterbegin");
  });
};
