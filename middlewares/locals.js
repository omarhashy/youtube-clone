module.exports.authLocals = (req, res, next) => {
  res.locals.isLoggedIn = req.isLoggedIn;
  res.locals.channelHandle = req.channelHandle;
  next();
};

module.exports.csrfTokenLocals = (req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  next();
};

