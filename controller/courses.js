const Course = require("../models/Course");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

module.exports.createCourse = async (req, res) => {
  try {
    const { title, description, category, duration } = req.body;
    let image = "";

    if (req.file) {
      const uploadRes = await cloudinary.uploader.upload(req.file.path, {
        folder: "courses",
      });
      image = uploadRes.secure_url;
      fs.unlinkSync(req.file.path);
    }

    const course = new Course({ title, description, category, duration, image });
    await course.save();
    res.status(201).json({ message: "Course created", course });
  } catch (err) {
    console.error("Error creating course:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports.getCourses = async (req, res) => {
  try {
    const courses = await Course.find().sort({ createdAt: -1 });
    res.status(200).json(courses);
  } catch (err) {
    console.error("Error fetching courses:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports.getCourseById = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await Course.findById(id);
    if (!course) return res.status(404).json({ error: "Course not found" });
    res.status(200).json(course);
  } catch (err) {
    console.error("Error fetching course:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports.updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, duration } = req.body;
    const update = { title, description, category, duration };

    if (req.file) {
      const uploadRes = await cloudinary.uploader.upload(req.file.path, {
        folder: "courses",
      });
      update.image = uploadRes.secure_url;
      fs.unlinkSync(req.file.path);
    }

    const course = await Course.findByIdAndUpdate(id, update, { new: true });
    if (!course) return res.status(404).json({ error: "Course not found" });
    res.status(200).json({ message: "Course updated", course });
  } catch (err) {
    console.error("Error updating course:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports.deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await Course.findByIdAndDelete(id);
    if (!course) return res.status(404).json({ error: "Course not found" });
    res.status(200).json({ message: "Course deleted" });
  } catch (err) {
    console.error("Error deleting course:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


