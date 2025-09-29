const CareerApplication = require("../models/careerApplication");
const nodemailer = require("nodemailer");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

module.exports.submitApplication = async (req, res) => {
  try {
    const { name, email, position, message, resume } = req.body;
    const application = new CareerApplication({
      name,
      email,
      position,
      resume,
      message,
    });
    await application.save();
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      pool: true,
      maxConnections: 5,
      maxMessages: 100,
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      replyTo: email,
      to: process.env.EMAIL_USER,
      subject: "New Career Application",
      html: `
        <h2>New Career Application</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Position:</strong> ${position}</p>
        <p><strong>Message:</strong> ${message}</p>
        <p><a href="${resume}" target="_blank">Download Resume</a></p>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Application submitted successfully!" });
  } catch (err) {
    console.error("Error submitting application:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports.getApplications = async (req, res) => {
  try {
    const applications = await CareerApplication.find().sort({ createdAt: -1 });
    res.status(200).json(applications);
  } catch (err) {
    console.error("Error fetching applications:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const validStatuses = ["pending", "reviewed", "accepted", "rejected"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }
    const application = await CareerApplication.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    if (!application) {
      return res.status(404).json({ error: "Application not found" });
    }
    res.status(200).json({ message: "Status updated", application });
  } catch (err) {
    console.error("Error updating status:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports.deleteApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const application = await CareerApplication.findByIdAndDelete(id);
    if (!application) {
      return res.status(404).json({ error: "Application not found" });
    }
    res.status(200).json({ message: "Application deleted" });
  } catch (err) {
    console.error("Error deleting application:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
