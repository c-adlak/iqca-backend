const mongoose = require("mongoose");

const memberSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    designation: {
      type: String,
      required: true,
    },
    about: {
      type: String,
      required: true,
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
