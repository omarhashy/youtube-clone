module.exports.get404 = (req, res, next) => {
  // console.log(req.isLoggedIn);
  res.status(404).json({ error: "Resource not found" });
};

module.exports.getError = (error, req, res, next) => {
  console.error(error);
  const status = error.statusCode ?? 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({
    message: message,
    data: data,
  });
};
