const express = require("express");
const router = express.Router();
const CoursesController = require("../controller/courses");
const UserController = require("../controller/Users");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads"),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

// Public
router.get("/", CoursesController.getCourses);
router.get("/:id", CoursesController.getCourseById);

// Admin-only mutations
router.post(
  "/",
  UserController.verifyToken,
  UserController.verifyAdmin,
  upload.single("image"),
  CoursesController.createCourse
);

router.patch(
  "/:id",
  UserController.verifyToken,
  UserController.verifyAdmin,
  upload.single("image"),
  CoursesController.updateCourse
);

router.delete(
  "/:id",
  UserController.verifyToken,
  UserController.verifyAdmin,
  CoursesController.deleteCourse
);

module.exports = router;


