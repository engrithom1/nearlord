const express = require('express')
const router = express.Router();

const authController = require("../controllers/authController");
const mainController = require("../controllers/mainController");
const checker = require("../middleware/authMiddleware");

///Auth routers
router.get("/login",checker.sessionChecker, authController.loginForm);
router.get("/register",checker.sessionChecker, authController.registerForm);
router.post("/login", authController.login);
router.post("/register", authController.register);
router.get("/logout", authController.logout);

module.exports = router; 