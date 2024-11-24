const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const DOMAIN_NAME = process.env.DOMAIN_NAME;
const SECRET_KEY = process.env.SECRET_KEY;

const { validationResult, Result } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(SENDGRID_API_KEY);

const sequelize = require("../../config/database");
const Channel = require("../../models/channel");
const Token = require("../../models/token");

exports.postRegister = async (req, res, next) => {
  const transaction = await sequelize.transaction();

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error("validation error");
      error.statusCode = 422;
      error.data = errors.array().map((err) => err.msg);
      throw error;
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 12);
    const channel = await Channel.create(
      {
        handle: req.body.handle,
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

    res.status(201).json({
      msg: "Channel created successfully, please verify your account ",
    });
    await transaction.commit();
  } catch (err) {
    console.error(err);
    await transaction.rollback();
    next(err);
  }
};

exports.postLogin = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error("validation error");
      error.statusCode = 422;
      error.data = errors.array().map((err) => err.msg);
      throw error;
    }

    const email = req.body.email;
    const password = req.body.password;

    const channel = await Channel.findOne({
      where: {
        email: email,
      },
    });

    if (!channel) {
      const error = new Error("wrong email or password");
      error.statusCode = 422;
      throw error;
    }

    const doMatch = await bcrypt.compare(password, channel.password);
    if (doMatch && !channel.verified) {
      const error = new Error("please verify your account");
      error.statusCode = 422;
      throw error;
    } else if (doMatch) {
      const jwtToken = jwt.sign(
        {
          channelHandle: channel.handle,
          channelId: channel.id,
        },
        SECRET_KEY,
        { expiresIn: "7d" }
      );

      res.status(200).json({
        jwtToken: jwtToken,
        channelHandle: channel.handle,
      });
      return;
    }
    const error = new Error("wrong email or password");
    error.statusCode = 422;
    throw error;
  } catch (error) {
    next(error);
  }
};
