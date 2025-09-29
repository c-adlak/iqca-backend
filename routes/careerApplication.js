const express = require("express");
const router = express.Router();
const careerController = require("../controller/careerApplication");
const multer = require("multer");

// Multer storage for resumes
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads"),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

router.post(
  "/apply",
  upload.single("resume"),
  careerController.submitApplication
);
router.get("/applications", careerController.getApplications);
router.patch("/applications/:id/status", careerController.updateStatus);
router.delete("/applications/:id", careerController.deleteApplication);

module.exports = router;
