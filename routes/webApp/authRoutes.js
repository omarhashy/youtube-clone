const express = require("express");
const authController = require("../../controllers/webApp/authController");
const validators = require("../../validators/auth");

const router = express.Router();

router.get("/register", authController.getRegister);
router.get("/login", authController.getLogin);
router.get("/verify/:token", authController.verify);
router.get("/reset-password/:token", authController.getResetPasswordToken);
router.get("/reset-password", authController.getResetPassword);

router.post("/register", validators.register, authController.postRegister);
router.post("/login", validators.login, authController.postLogin);
router.post(
  "/reset-password",
  validators.resetPassword,
  authController.postResetPassword
);
router.post(
  "/reset-password-token",
  validators.getResetPasswordToken,
  authController.postResetPasswordToken
);
router.post("/logout", authController.postLogout);

module.exports = router;
