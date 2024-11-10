const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const DOMAIN_NAME = process.env.DOMAIN_NAME;

const { validationResult, Result } = require("express-validator");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(SENDGRID_API_KEY);

const sequelize = require("../../config/database");
const Channel = require("../../models/channel");
const Token = require("../../models/token");

exports.getRegister = (req, res, next) => {
  context = {
    errorMessages: JSON.stringify(req.flash("errors") ?? []),
    successMessages: JSON.stringify(req.flash("successes") ?? []),
    pageTile: "Register",
    pageHeader: "Register",
  };
  res.render("auth/auth.ejs", context);
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

    const hashedPassword = await bcrypt.hash(req.body.password, 12);
    const channel = await Channel.create(
      {
        handel: req.body.handel,
        email: req.body.email,
        password: hashedPassword,
        name: req.body.channelName,
        channelPicturePath: req.file.path,
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
    errorMessages: JSON.stringify(req.flash("errors") ?? []),
    successMessages: JSON.stringify(req.flash("successes") ?? []),
    pageTile: "Login",
    pageHeader: "Login",
  };
  res.render("auth/auth.ejs", context);
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

exports.getResetPasswordToken = (req, res, next) => {
  context = {
    errorMessages: JSON.stringify(req.flash("errors") ?? []),
    successMessages: JSON.stringify(req.flash("successes") ?? []),
    pageTile: "Create a new password",
    pageHeader: "Create a new password",
  };
  res.render("auth/auth.ejs", context);
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
    }
    const channel = await Channel.findOne(
      { where: { id: token.channelId } },
      transaction
    );
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
