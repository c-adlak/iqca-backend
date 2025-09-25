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

// Submit application (with resume upload)
router.post("/apply", upload.single("resume"), careerController.submitApplication);
// Get all applications (admin)
router.get("/applications", careerController.getApplications);
// Update application status (admin)
router.patch("/applications/:id/status", careerController.updateStatus);
// Delete application (admin)
router.delete("/applications/:id", careerController.deleteApplication);

module.exports = router;
