const BoardMembers = require("../models/boardMembers");
const nodemailer = require("nodemailer");
const auth = require("dotenv").config();
const fs = require("fs");
const path = require("path");
module.exports.boardMemberInquiry = async (req, res) => {
  try {
    const {
      name,
      email,
      designation,
      about,
      linkedin,
      keyRolesAndExpertise,
      region,
    } = req.body;
    const photo = req.file ? `/uploads/${req.file.filename}` : "";
    console.log("Request Body:", req.body);
    console.log("Request File:", req.file);
    console.log("Body:", req.body);
    console.log("File:", req.file);
    console.log(auth.parsed, "auth");

    const newMember = new BoardMembers({
      name,
      email,
      designation,
      about,
      linkedin,
      photo,
      keyRolesAndExpertise: keyRolesAndExpertise
        .split(",")
        .map((s) => s.trim()),
      region,
    });

    await newMember.save();
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: "your-admin-email@gmail.com",
      to: "admin@example.com",
      subject: "New Board Member Inquiry",
      html: `
    <h2>New Inquiry for Board Membership</h2>
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Designation:</strong> ${designation}</p>
    <p><strong>About:</strong> ${about}</p>
    <p><strong>Region:</strong> ${region}</p>
    <p><strong>Expertise:</strong> ${keyRolesAndExpertise}</p>
    <p><strong>LinkedIn:</strong> <a href="${linkedin}" target="_blank">${linkedin}</a></p>
    <div><img src="http://localhost:5000${photo}" alt="Photo" width="100"/></div>
    <p><a href="https://iqca-git-main-chandan-adlaks-projects-12671759.vercel.app/dashboard" target="_blank">Review Applications in Dashboard</a></p>
  `,
    };

    await transporter.sendMail(mailOptions);

    res
      .status(200)
      .json({ message: "Board member inquiry received and email sent!" });
  } catch (err) {
    console.error("Error saving board member:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
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
    console.log(id, "id");

    // Find the member
    const member = await BoardMembers.findById(id);
    if (!member) {
      return res.status(404).json({ error: "Member not found" });
    }

    // Delete image from filesystem if it exists
    const imagePath = path.join(__dirname, "..", "uploads", member.photo);
    fs.unlink(imagePath, (err) => {
      if (err) console.warn("Image deletion failed:", err.message);
    });

    // Delete the member from database
    await BoardMembers.findByIdAndDelete(id);

    res.status(200).json({ message: "Request rejected and member deleted" });
  } catch (err) {
    console.error("Error rejecting request:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
