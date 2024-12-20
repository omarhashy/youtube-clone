const { body } = require("express-validator");
const Channel = require("../models/channel");
const { where } = require("sequelize");

module.exports.register = [
  body("channelName")
    .isString()
    .isLength({ min: 3 })
    .withMessage("Please enter a channel name with at least 3 characters.")
    .isLength({ max: 50 })
    .withMessage("Channel name cannot have more than 50 characters.")
    .trim(),

  body("handle")
    .isAlphanumeric()
    .withMessage("Channel handle cannot contain spaces")
    .isLength({ min: 3 })
    .withMessage("Please enter a channel handle with at least 3 characters.")
    .isLength({ max: 20 })
    .withMessage("Channel handle cannot have more than 20 characters.")
    .custom((value, { req }) => {
      return Channel.findOne({ where: { handle: value } }).then((userDoc) => {
        if (userDoc) {
          return Promise.reject(
            "Handle exists already, please pick a different one."
          );
        }
      });
    })
    .trim(),

  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please enter a valid email.")
    .custom((value, { req }) => {
      return Channel.findOne({ where: { email: value } }).then((userDoc) => {
        if (userDoc) {
          console.log(userDoc);
          return Promise.reject(
            "E-mail exists already, please pick a different one."
          );
        }
      });
    })
    .trim(),

  body("password")
    .isLength({ min: 8 })
    .withMessage("Please enter a password with at least 8 characters.")
    .isAlphanumeric()
    .withMessage("Password must contain only numbers and letters.")
    .trim(),

  body("confirmPassword")
    .custom((value, { req }) => {
      if (value === req.body.password) return true;
      throw new Error("Passwords must match!");
    })
    .trim(),
];

module.exports.getResetPasswordToken = [
  body("password")
    .isLength({ min: 8 })
    .withMessage("Please enter a password with at least 8 characters.")
    .isAlphanumeric()
    .withMessage("Password must contain only numbers and letters.")
    .trim(),

  body("confirmPassword")
    .custom((value, { req }) => {
      if (value === req.body.password) return true;
      throw new Error("Passwords must match!");
    })
    .trim(),
];
module.exports.login = [
  body("email")
    .notEmpty()
    .withMessage("email can not be empty")
    .isEmail()
    .withMessage("invalid email")
    .normalizeEmail(),
  body("password").notEmpty().withMessage("password can not be empty").trim(),
];

module.exports.resetPassword = [
  body("email")
    .notEmpty()
    .withMessage("email can not be empty")
    .isEmail()
    .withMessage("invalid email")
    .normalizeEmail(),
];
