exports.get404 = (req, res, next) => {
  const context = { errorMessage: "Page not found", path: "/error" };
  res.status(404).render("error/error", context);
};

exports.get500 = (error, req, res, next) => {
  console.error(error);
  const context = { errorMessage: "server-side error" , path : "/error"};
  res.status(500).render("error/error",context );
};
