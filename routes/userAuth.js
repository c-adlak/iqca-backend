const express = require("express");
const router = express.Router();
const usersController = require("../controller/Users");
router.route("/login").post(usersController.login);
router.route("/register").post(usersController.register);
router.route("/admin-login").post(usersController.adminLogin);
router.route("/admin-register").post(usersController.createAdmin);
module.exports = router;
