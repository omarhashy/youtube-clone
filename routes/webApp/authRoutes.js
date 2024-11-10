const express = require("express");
const authController = require("../../controllers/webApp/authController");
const validators = require("../../validators/auth");

const router = express.Router();

router.get("/register", authController.getRegister);
router.get("/login", authController.getLogin);
router.get("/verify/:token", authController.verify);

// router.get("/reset-password", authController.getResetPassword);
// router.get("/reset-password/:token",authController.getResetPasswordToken);

router.post("/register", validators.register, authController.postRegister);

module.exports = router;
