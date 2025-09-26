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

module.exports.boardMemberInquiry = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      about,
      country,
    } = req.body;

    let photo = "";
    // Upload image to Cloudinary if file exists
    if (req.file) {
      const cloudResult = await cloudinary.uploader.upload(req.file.path, {
        folder: "board_members",
      });
      photo = cloudResult.secure_url;
      fs.unlinkSync(req.file.path);
    }

    const newMember = new BoardMembers({
      name,
      email,
      about,
      phone,
      photo,
      country,
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
      from: `${email}`,
      to: `${process.env.EMAIL_USER}`,
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
        ${
          photo
            ? `<div><img src="${photo}" alt="Photo" width="100"/></div>`
            : ""
        }
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
