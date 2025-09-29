const BoardMembers = require("../models/boardMembers");
const nodemailer = require("nodemailer");
const auth = require("dotenv").config();
const path = require("path");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  secure: true,
});

module.exports.boardMemberInquiry = async (req, res) => {
  try {
    const { name, email, phone, about, country } = req.body;

    let photo = null;

    // Upload photo if provided
    if (req.file) {
      try {
        const cloudResult = await cloudinary.uploader.upload(req.file.path, {
          folder: "board_members",
          resource_type: "auto",
        });
        photo = cloudResult.secure_url;

        // Delete temp file after upload
        fs.unlink(req.file.path, (err) => {
          if (err) console.error("Error deleting temp file:", err);
        });
      } catch (uploadError) {
        console.error("Cloudinary upload error:", uploadError);
        fs.unlink(req.file.path, (err) => {
          if (err) console.error("Error deleting temp file:", err);
        });
      }
    }

    // Save to DB
    const newMember = new BoardMembers({
      name,
      email,
      phone,
      about,
      country,
      ...(photo && { photo }),
    });

    await newMember.save();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      replyTo: email,
      to: process.env.EMAIL_USER,
      subject: "New Board Member Inquiry",
      html: `
        <h2>New Inquiry for Board Membership</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>About:</strong> ${about}</p>
        <p><strong>Country:</strong> ${country}</p>
        ${
          photo
            ? `<div><img src="${photo}" alt="Photo" width="100"/></div>`
            : ""
        }
      `,
    };

    // not sending mail for now
    // await transporter.sendMail(mailOptions);
    console.log("Email sent successfully");

    // Send response to frontend
    res.status(200).json({
      message: "Board member inquiry received and email sent!",
      success: true,
    });
  } catch (err) {
    console.error("Error saving board member:", err);

    if (req.file && req.file.path) {
      fs.unlink(req.file.path, (unlinkErr) => {
        if (unlinkErr) console.error("Error deleting temp file:", unlinkErr);
      });
    }

    if (err.name === "ValidationError") {
      const validationErrors = Object.values(err.errors).map((e) => e.message);
      res.status(400).json({
        error: "Validation Error",
        details: validationErrors,
        success: false,
      });
    } else {
      res.status(500).json({
        error: "Internal Server Error",
        message:
          process.env.NODE_ENV === "development"
            ? err.message
            : "Something went wrong",
        success: false,
      });
    }
  }
};

module.exports.getBoardMembers = async (req, res) => {
  try {
    const members = await BoardMembers.find();
    res.status(200).json(members);
  } catch (err) {
    console.error("Error fetching board members:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
module.exports.acceptRequest = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id, "id");
    const member = await BoardMembers.findByIdAndUpdate(
      id,
      { status: true },
      { new: true }
    );

    if (!member) {
      return res.status(404).json({ error: "Member not found" });
    }

    res.status(200).json({ message: "Request accepted", member });
  } catch (err) {
    console.error("Error accepting request:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
module.exports.rejectRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const member = await BoardMembers.findById(id);
    if (!member) {
      return res.status(404).json({ error: "Member not found" });
    }
    if (member.photo) {
      const imagePath = path.join(__dirname, "..", "uploads", member.photo);
      fs.unlink(imagePath, (err) => {
        if (err) console.warn("Image deletion failed:", err.message);
      });
    }
    await BoardMembers.findByIdAndDelete(id);

    res.status(200).json({ message: "Request rejected and member deleted" });
  } catch (err) {
    console.error("Error rejecting request:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
