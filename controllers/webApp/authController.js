exports.register = (req, res, next) => {
  context = {
    pageTile: "Register",
    PageHeader: "Register",
  };
  res.render('auth/auth.ejs',context);
};
