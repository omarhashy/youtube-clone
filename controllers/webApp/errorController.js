exports.get404 = (req, res, next) => {
  const context = { errorMessage: "Page not found", pageTile: "error 404" };
  res.status(404).render("error/error", context);
};

exports.get500 = (error, req, res, next) => {
  if (error.message.includes("CSRF")) {
    res.status(403).send("<h1>invalid csrf token</h1>");
    return;
  }

  if (error.NLoggedIn) {
    req.flash("errors", ["unauthorized access!"]);
    res.redirect("/auth/login");
    return;
  }

  if (error.LoggedIn) {
    res.redirect("/");
    return;
  }
  const context = { errorMessage: "server-side error", pageTile: "error 500" };
  res.status(500).render("error/error", context);
};
