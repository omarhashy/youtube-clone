exports.register = (req, res, next) => {
  context = {
    pageTile: "Register",
    PageHeader: "Register",
  };
  res.render('auth/auth.ejs',context);
};


exports.login = (req, res, next) => {
  context = {
    pageTile: "Login",
    PageHeader: "Login",
  };
  res.render("auth/auth.ejs", context);
};
exports.resetPassword = (req, res, next) => {
  context = {
    pageTile: "Reset Password",
    PageHeader: "Reset Password",
  };
  res.render("auth/auth.ejs", context);
};


exports.resetPasswordToken = (req, res, next) => {
  context = {
    pageTile: "Create a new password",
    PageHeader: "Create a new password",
  };
  res.render("auth/auth.ejs", context);
};