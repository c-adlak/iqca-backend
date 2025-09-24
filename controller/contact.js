const nodemailer = require("nodemailer");

module.exports.sendEmail = async (req, res) => {
  const { name, email, phone, interest, message, newsletter } = req.body;
  console.log("Received contact form data:", req.body);
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
    subject: "New Inquiry Submission",
    html: `
      <h2>New Inquiry Received</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Interest:</strong> ${interest}</p>
      <p><strong>Newsletter:</strong> ${newsletter ? "Yes" : "No"}</p>
      <p><strong>Message:</strong><br/>${message}</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Email sent successfully!" });
  } catch (error) {
    console.error("Email send error:", error);
    res.status(500).json({ error: "Failed to send email." });
  }
};
