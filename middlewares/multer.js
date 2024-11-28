const multer = require("multer");
const { v4: uuidv4 } = require("uuid");

const fileStorageSingle = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads");
  },
  filename: (req, file, cb) => {
    cb(null, uuidv4() + file.originalname);
  },
});

const fileFilterSingle = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    console.log("file input");
    cb(null, true);
  } else {
    cb(null, false);
  }
};
module.exports.single = multer({
  storage: fileStorageSingle,
  fileFilter: fileFilterSingle,
}).single("channelPicture");
