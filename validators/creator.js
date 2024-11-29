const { body } = require("express-validator");

const MIN_TITLE_LENGTH = 3;
const MAX_TITLE_LENGTH = 255;

const MIN_DESCRIPTION_LENGTH = 3;
const MAX_DESCRIPTION_LENGTH = 255;

module.exports.uploadVideo = [
  body("title")
    .isString()
    .isLength({ min: MIN_TITLE_LENGTH, max: MAX_TITLE_LENGTH })
    .withMessage(
      `Video title can not have less than ${MIN_TITLE_LENGTH} characters and more than ${MAX_TITLE_LENGTH} characters.`
    )
    .trim(),

  body("description")
    .isString()
    .isLength({ min: MIN_DESCRIPTION_LENGTH, max: MAX_DESCRIPTION_LENGTH })
    .withMessage(
      `Video description can not have less than ${MIN_DESCRIPTION_LENGTH} characters and more than ${MAX_DESCRIPTION_LENGTH} characters.`
    )
    .trim(),
];

module.exports;
