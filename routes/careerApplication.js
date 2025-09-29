const express = require("express");
const router = express.Router();
const careerController = require("../controller/careerApplication");
const multer = require("multer");

router.post("/apply", careerController.submitApplication);
router.get("/applications", careerController.getApplications);
router.patch("/applications/:id/status", careerController.updateStatus);
router.delete("/applications/:id", careerController.deleteApplication);

module.exports = router;
