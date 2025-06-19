const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports.register = async (req, res) => {
  try {
    const { username, password, role = "student" } = req.body; // Default role is student

    // Validate role
    if (!["admin", "student"].includes(role)) {
      return res
        .status(400)
        .json({ error: "Invalid role. Must be 'admin' or 'student'" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: "Username already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      username,
      password: hashedPassword,
      role,
    });

    await user.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error registering user:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Fixed typo: findone -> findOne
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid password" });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        username: user.username,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "10h" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error logging in user:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Middleware to verify JWT token and user role
module.exports.verifyToken = (req, res, next) => {
  console.log("Verifying token...", req.header("Authorization")); // Debugging line to check the Authorization header
  const token = req.header("Authorization")?.replace("Bearer ", "");
  console.log("Token:", token); // Debugging line to check the token
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.user = decoded;
  console.log("Decoded user:", req.user);
  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token." });
  }
};

// Middleware to check if user is admin
module.exports.verifyAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({ error: "Access denied. Admin role required." });
  }
  next();
};

// Middleware to check if user is student
module.exports.verifyStudent = (req, res, next) => {
  if (req.user.role !== "student") {
    return res
      .status(403)
      .json({ error: "Access denied. Student role required." });
  }
  next();
};

//--------------------admin controllers

module.exports.createAdmin = async (req, res) => {
  try {
    const existingAdmin = await User.findOne({
      username: "admin",
      role: "admin",
    });

    if (existingAdmin) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    const hashedPassword = await bcrypt.hash("admin123", 10);

    const admin = new User({
      username: "admin",
      password: hashedPassword,
      role: "admin", // ✅ Ensures role is set
    });

    await admin.save();

    res.status(201).json({
      message: "Admin created successfully",
      admin: {
        id: admin._id,
        username: admin.username,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("Error creating admin:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// ✅ Admin login
module.exports.adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    const admin = await User.findOne({ username, role: "admin" });
    if (!admin) {
      return res.status(404).json({ error: "Admin not found" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid password" });
    }

    // ✅ Include role in token
    const token = jwt.sign(
      {
        userId: admin._id,
        username: admin.username,
        role: admin.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "10h" }
    );

    res.status(200).json({
      message: "Admin login successful",
      token,
      user: {
        id: admin._id,
        username: admin.username,
        role: admin.role, // ✅ Send back role in response
      },
    });
  } catch (error) {
    console.error("Admin login error:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
