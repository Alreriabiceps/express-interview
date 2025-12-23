const { getHomepageData } = require("./homepage.model");

async function getHomepage(req, res) {
  try {
    const data = await getHomepageData();
    res.json(data);
  } catch (err) {
    console.error("Error fetching homepage data:", err);
    res.status(500).json({ error: "Failed to load homepage data" });
  }
}

module.exports = {
  getHomepage,
};
