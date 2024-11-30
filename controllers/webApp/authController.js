const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const DOMAIN_NAME = process.env.DOMAIN_NAME;

const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(SENDGRID_API_KEY);

const sequelize = require("../../config/database");
const Channel = require("../../models/channel");
const Token = require("../../models/token");
const { reset } = require("nodemon");
const { where } = require("sequelize");

exports.getRegister = (req, res, next) => {
  context = {
    pageTile: "Register",
    pageHeader: "Register",
  };
  res.render("/auth/auth.ejs", context);
};

exports.postRegister = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.flash(
        "errors",
        errors.array().map((i) => i.msg)
      );
      res.redirect("/auth/register");
      return;
    }
    if (!req.file) {
      req.flash("errors", ["thumbnail is required"]);
      res.redirect("/auth/register");
      return;
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 12);
    const channel = await Channel.create(
      {
        handle: req.body.handle,
        email: req.body.email,
        password: hashedPassword,
        name: req.body.channelName,
        channelPictureFile: req.file.filename,
      },
      {
        transaction,
      }
    );

    const token = await Token.create(
      {
        token: uuidv4(),
        channelId: channel.id,
      },
      { transaction }
    );

    const msg = {
      to: channel.email,
      from: process.env.SENDGRID_EMAIL,

      subject: "Confirm email now",
      html: `
        <h1>welcome to youtube clone</h1>
        <p> confirmation link: ${DOMAIN_NAME}/auth/verify/${token.token}: </p>
      `,
    };

    sgMail.send(msg);

    await transaction.commit();

    req.flash("successes", ["please confirm your email address"]);
    res.redirect("/auth/login");
  } catch (err) {
    await transaction.rollback();
    next(err);
  }
};

exports.getLogin = (req, res, next) => {
  context = {
    pageTile: "Login",
    pageHeader: "Login",
  };
  res.render("auth/auth.ejs", context);
};

exports.postLogin = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash(
      "errors",
      errors.array().map((i) => i.msg)
    );
    res.redirect("/auth/login");
    return;
  }

  try {
    const email = req.body.email;
    const password = req.body.password;

    const channel = await Channel.findOne({
      where: {
        email: email,
      },
    });

    if (!channel) {
      req.flash("errors", ["wrong email or password"]);
      res.redirect("/auth/login");
      return;
    }

    const doMatch = await bcrypt.compare(password, channel.password);
    if (doMatch && !channel.verified) {
      req.flash("errors", ["please verify your account"]);
    } else if (doMatch) {
      req.session.isLoggedIn = true;
      req.session.channelHandle = channel.handle;
      req.session.channelId = channel.id;
      await req.session.save((error) => {
        if (error) throw error;
      });
      res.redirect("/");
      return;
    } else {
      req.flash("errors", ["wrong email or password"]);
    }

    res.redirect("/auth/login");
  } catch (error) {
    next(error);
  }
};

exports.getResetPassword = (req, res, next) => {
  context = {
    errorMessages: JSON.stringify(req.flash("errors") ?? []),
    successMessages: JSON.stringify(req.flash("successes") ?? []),
    pageTile: "Reset Password",
    pageHeader: "Reset Password",
  };
  res.render("auth/auth.ejs", context);
};

exports.postResetPassword = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash(
      "errors",
      errors.array().map((i) => i.msg)
    );
    res.redirect("/auth/reset-password");
    return;
  }

  try {
    const email = req.body.email;

    const channel = await Channel.findOne({
      where: {
        email: email,
      },
    });

    if (!channel) {
      req.flash("errors", ["there is no chanel with this email"]);
      res.redirect("/auth/login");
      return;
    }

    const token = await Token.create({
      token: uuidv4(),
      channelId: channel.id,
      reset: true,
    });

    const msg = {
      to: channel.email,
      from: process.env.SENDGRID_EMAIL,

      subject: "reset password",
      html: `
        <h1>reset password</h1>
        <p>link: ${DOMAIN_NAME}/auth/reset-password/${token.token}: </p>
      `,
    };

    sgMail.send(msg);
    req.flash("successes", ["check your email"]);
    res.redirect("/auth/login");
  } catch (err) {
    next(err);
  }
};

exports.getResetPasswordToken = async (req, res, next) => {
  try {
    const token = await Token.findOne({
      where: {
        token: req.params.token,
      },
    });

    if (!token || !token.reset) {
      throw new Error("invalid token");
    }
    if (token.createdAt + 30 * 60 * 1000 < Date.now()) {
      await token.destroy();
      req.flash("errors", ["no longer invalid token"]);
      res.redirect("/auth/login");
      return;
    }
    const context = {
      token: req.params.token,
      errorMessages: JSON.stringify(req.flash("errors") ?? []),
      successMessages: JSON.stringify(req.flash("successes") ?? []),
      pageTile: "Create a new password",
      pageHeader: "Create a new password",
    };
    res.render("auth/auth.ejs", context);
  } catch (err) {
    next(err);
  }
};

exports.postResetPasswordToken = async (req, res, next) => {
  if (!req.body.token) {
    next(new Error("invalid Token"));
    return;
  }
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash(
      "errors",
      errors.array().map((i) => i.msg)
    );
    res.redirect(`/auth/reset-password/${req.body.token}`);
    return;
  }

  try {
    const token = await Token.findOne({ where: { token: req.body.token } });
    if (!token || !token.reset) {
      throw new Error("invalid token NO TOKEN FOUND");
    }

    if (token.createdAt + 30 * 60 * 1000 < Date.now()) {
      await token.destroy();
      req.flash("errors", ["no longer invalid token"]);
      res.redirect("/auth/login");
      return;
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 12);
    const chanel = await Channel.findOne({
      where: {
        id: token.channelId,
      },
    });
    chanel.password = hashedPassword;
    await chanel.save();
    await token.destroy();
    req.flash("successes", ["password changed successfully"]);
    res.redirect("/auth/login");
  } catch (error) {
    next(error);
  }
};

exports.verify = async (req, res, next) => {
  const transaction = await sequelize.transaction();

  try {
    const token = await Token.findOne(
      { where: { token: req.params.token } },
      transaction
    );
    if (!token || token.reset) {
      req.flash("errors", ["invalid token"]);
      res.redirect("/auth/register");
      return;
    }

    const channel = await Channel.findByPk(token.channelId, { transaction });
    channel.verified = true;
    await channel.save({ transaction });
    await token.destroy({ transaction });

    await transaction.commit();
    req.flash("successes", ["email verified successfully"]);
    res.redirect("/auth/login");
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    if (err) throw err;
    res.redirect("/");
  });
};
