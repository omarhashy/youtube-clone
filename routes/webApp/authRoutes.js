const express = require("express");
const authController = require("../../controllers/webApp/authController");
const router = express.Router();

router.get("/register", authController.register);
router.get("/login", authController.login);
router.get("/reset-password", authController.resetPassword);
router.get("/reset-password/:token",authController.resetPasswordToken);

router.get("/verify/:token");

module.exports = router;
