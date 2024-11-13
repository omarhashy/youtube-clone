const express = require("express");
const authController = require("../../controllers/API/authController");
const validators = require("../../validators/auth");

const router = express.Router();

router.post("/register", validators.register, authController.postRegister);
router.post("/login", validators.login, authController.postLogin);

module.exports = router;
