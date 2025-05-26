const express = require("express");
const router = express.Router();
const ContactController = require("../controller/contact");
router.route("/send-email").post(ContactController.sendEmail);

module.exports = router;
