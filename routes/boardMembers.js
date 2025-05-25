const express = require("express");
const router = express.Router();
const BoardMembersController = require("../controller/boardMember");
const multer = require("multer");

// Define storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads"),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

const upload = multer({ storage });

// Route with file upload
router
  .route("/board-member-inquiry")
  .post(upload.single("photo"), BoardMembersController.boardMemberInquiry);
router.route("/get-board-members").get(BoardMembersController.getBoardMembers);
router.route("/accept-request/:id").patch(BoardMembersController.acceptRequest);
router.route("/reject-request/:id").patch(BoardMembersController.rejectRequest);

module.exports = router;
