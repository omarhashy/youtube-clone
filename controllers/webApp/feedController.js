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

exports.getVideo = (req, res, next) => {
  const videoId = req.params.videoId;
  context = { pageTile: "video title" };
  res.status(200).render("feed/video.ejs", context);
};
