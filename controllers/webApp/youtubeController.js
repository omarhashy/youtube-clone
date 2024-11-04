exports.index = (req, res, next) => {
  context = { path: "/" };
  res.status(200).render("youtube/home.ejs", context);
};
