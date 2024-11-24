module.exports = (req, res, next) => {
  res.locals.isLoggedIn = req.isLoggedIn;
  res.locals.channelHandle = req.channelHandle;
  res.locals.csrfToken = req.csrfToken();
  next();
};
