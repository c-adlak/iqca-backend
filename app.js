const express = require("express");
const cors = require("cors");
require("dotenv").config();
const boardMembers = require("./routes/boardMembers");
const mongoose = require("mongoose");
const app = express();
app.use(
  cors({
    origin: ["https://www.iqcaboard.co.uk", "https://iqca-dun.vercel.app"],
    credentials: true,
  })
);
app.use(express.json());

//mongoDB connection
const MONGO_URL =
  "mongodb+srv://apconsultancy36:Ye7uV1iRtUs8xEwS@cluster0.iezchd7.mongodb.net/IQCA?retryWrites=true&w=majority&appName=Cluster0";

// Proper connection function with options
async function main() {
  try {
    await mongoose.connect(MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000, // timeout after 10s
    });
    console.log("✅ Connected to MongoDB Atlas");
  } catch (err) {
    console.error("❌ Error connecting to MongoDB:", err.message);
  }
}

main();
// Example route
app.get("/", (req, res) => {
  res.json({ message: "Server is running!" });
});
app.use("/boardMembers", boardMembers);
app.use("/uploads", express.static("uploads"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
