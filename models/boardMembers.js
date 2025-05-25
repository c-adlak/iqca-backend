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
      enum: ["North", "South", "East", "West", "Central"], // customize as needed
    },
    status: {
      type: Boolean,
      default: false, // false = rejected, true = accepted
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Member", memberSchema);
