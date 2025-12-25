const mongoose = require("mongoose");

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/aaaaaa_dev";

async function connectDB() {
  try {
    await mongoose.connect(MONGO_URI);
    const dbName = MONGO_URI.split("/").pop() || "database";
    console.log(`MongoDB connected to database: ${dbName}`);
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    console.error("Make sure MongoDB is running locally on port 27017");
    process.exit(1);
  }
}

module.exports = connectDB;
