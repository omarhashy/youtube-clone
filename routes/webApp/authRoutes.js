const express = require("express");
const authController = require("../../controllers/webApp/authController");
const authenticationMiddlewares = require("../../middlewares/authentication");
const validators = require("../../validators/auth");

const router = express.Router();

router.get(
  "/register",
  authenticationMiddlewares.requireNLogin,
  authController.getRegister
);
router.get(
  "/login",
  authenticationMiddlewares.requireNLogin,
  authController.getLogin
);
router.get("/verify/:token", authController.verify);
router.get(
  "/reset-password/:token",
  authenticationMiddlewares.requireNLogin,
  authController.getResetPasswordToken
);
router.get(
  "/reset-password",
  authenticationMiddlewares.requireNLogin,
  authController.getResetPassword
);

router.post(
  "/register",
  authenticationMiddlewares.requireNLogin,
  validators.register,
  authController.postRegister
);
router.post(
  "/login",
  authenticationMiddlewares.requireNLogin,
  validators.login,
  authController.postLogin
);
router.post(
  "/reset-password",
  authenticationMiddlewares.requireNLogin,
  validators.resetPassword,
  authController.postResetPassword
);
router.post(
  "/reset-password-token",
  authenticationMiddlewares.requireNLogin,
  validators.getResetPasswordToken,
  authController.postResetPasswordToken
);

router.post("/logout", authController.postLogout);

module.exports = router;
