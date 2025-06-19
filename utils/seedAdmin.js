const bcrypt = require("bcryptjs");
const User = require("../models/User");

const seedAdmin = async () => {
  try {
    const existingAdmin = await User.findOne({
      username: "adminIqcaboard",
      role: "admin",
    });

    if (existingAdmin) {
      console.log("✅ Admin already exists");
      return;
    }

    const hashedPassword = await bcrypt.hash("IQCABoard@IQ", 10);

    const admin = new User({
      username: "adminIqcaboard",
      password: hashedPassword,
      role: "admin",
    });

    await admin.save();
    console.log("🎉 Admin user created successfully");
  } catch (error) {
    console.error("❌ Error seeding admin user:", error.message);
  }
};

module.exports = seedAdmin;
