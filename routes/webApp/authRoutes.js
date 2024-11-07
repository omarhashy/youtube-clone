const express = require("express");
const authController = require("../../controllers/webApp/authController");
const router = express.Router();

router.get("/register", authController.register);

router.get("/login");
router.get("/reset-password");
router.get("/reset-password/:token");
router.get("/verify/:token");

module.exports = router;
