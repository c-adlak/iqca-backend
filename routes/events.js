const express = require("express");
const router = express.Router();
const EventsController = require("../controller/events");
const UserController = require("../controller/Users");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads"),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

// Public
router.get("/", EventsController.getEvents);
router.get("/:id", EventsController.getEventById);

// Admin-only mutations with optional image (field: image) and pdf (field: pdf)
router.post(
  "/",
  UserController.verifyToken,
  UserController.verifyAdmin,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "pdf", maxCount: 1 },
  ]),
  EventsController.createEvent
);

router.patch(
  "/:id",
  UserController.verifyToken,
  UserController.verifyAdmin,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "pdf", maxCount: 1 },
  ]),
  EventsController.updateEvent
);

router.delete(
  "/:id",
  UserController.verifyToken,
  UserController.verifyAdmin,
  EventsController.deleteEvent
);

module.exports = router;


