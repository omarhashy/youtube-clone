exports.get404 = (req, res, next) => {
  const context = { errorMessage: "Page not found", pageTile: "error 404" };
  res.status(404).render("error/error", context);
};

exports.get500 = (error, req, res, next) => {
  console.error(error);
  if (error.NLoggedIn) {
    res.redirect(401, "/auth/login");
    return;
  }

  if (error.LoggedIn) {
    res.redirect(401, "/");
    return;
  }
  const context = { errorMessage: "server-side error", pageTile: "error 500" };
  res.status(500).render("error/error", context);
};
