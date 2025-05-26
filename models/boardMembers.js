const mongoose = require("mongoose");

const memberSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    designation: {
      type: String,
      required: true,
    },
    about: {
      type: String,
      required: true,
    },
    linkedin: {
      type: String,
      trim: true,
      match: [
        /^https?:\/\/(www\.)?linkedin\.com\/.*$/,
        "Please provide a valid LinkedIn profile URL",
      ],
    },
    photo: {
      type: String, // Store URL or file path
      required: true,
    },
    keyRolesAndExpertise: {
      type: [String], // Array of strings
      default: [],
    },
    region: {
      type: String,
      required: true,
    },
    status: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Member", memberSchema);
