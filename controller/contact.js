const nodemailer = require("nodemailer");

module.exports.sendEmail = async (req, res) => {
  const { name, email, phone, interest, message, newsletter } = req.body;

  if (!name || !email || !message) {
    return res
      .status(400)
      .json({ error: "Name, email, and message are required." });
  }

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error("Email credentials not configured");
    return res.status(500).json({ error: "Email service not configured." });
  }

  console.log(
    "Email credentials found:",
    process.env.EMAIL_USER ? "Yes" : "No"
  );

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // use SSL
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // MUST be Gmail App Password
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER, // always your Gmail
    replyTo: email, // user email shown in "reply-to"
    to: process.env.EMAIL_USER,
    subject: "New Inquiry Submission",
    html: `
      <h2>New Inquiry Received</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone || "N/A"}</p>
      <p><strong>Interest:</strong> ${interest || "N/A"}</p>
      <p><strong>Newsletter:</strong> ${newsletter ? "Yes" : "No"}</p>
      <p><strong>Message:</strong><br/>${message}</p>
    `,
  };

  try {
    console.log("Attempting to send email...");
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info.response);

    res.status(200).json({ message: "Email sent successfully!" });
  } catch (error) {
    console.error("Email send error details:", {
      message: error.message,
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode,
    });

    res.status(500).json({
      error: "Failed to send email.",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
