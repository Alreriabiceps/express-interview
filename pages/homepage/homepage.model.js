const mongoose = require("mongoose");

const HomepageSchema = new mongoose.Schema(
  {
    welcomeMessage: {
      type: String,
      required: true,
      default: "Welcome to the homepage",
    },
  },
  { timestamps: true }
);

const Homepage = mongoose.model("Homepage", HomepageSchema);

async function getHomepageData() {
  let doc = await Homepage.findOne();
  if (!doc) {
    // Seed a default document on first read
    doc = await Homepage.create({});
  }
  return doc;
}

module.exports = {
  Homepage,
  getHomepageData,
};
