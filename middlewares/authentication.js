const SECRET_KEY = process.env.SECRET_KEY;
const jwt = require("jsonwebtoken");

module.exports.authenticate = (req, res, next) => {
  if (req.session?.isLoggedIn) {
    req.isLoggedIn = true;
    req.channelHandle = req.session.channelHandle;
    req.channelId = req.session.channelId;
    next();
    return;
  }

  const authHeader = req.get("Authorization");
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    let decodedToken;
    try {
      decodedToken = jwt.verify(token, SECRET_KEY);
    } catch (err) {
      throw err;
    }
    if (decodedToken) {
      req.isLoggedIn = true;
      req.channelHandle = decodedToken.channelHandle;
      req.channelId = decodedToken.channelId;
      next();
      return;
    }
  }
  req.isLoggedIn = false;
  next();
};

module.exports.requireLogin = (req, res, next) => {
  if (!req.isLoggedIn) {
    const err = new Error("User is not logged in");
    err.status = 401;
    err.NLoggedIn = true;
    throw err;
  }
  next();
};
module.exports.requireNLogin = (req, res, next) => {
  if (!req.isLoggedIn) {
    const err = new Error("User is logged in");
    err.status = 401;
    err.NLoggedIn = true;
    throw err;
  }
  next();
};
