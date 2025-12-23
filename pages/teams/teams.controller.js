const { getTeamsData } = require("./teams.model");

async function getTeams(req, res) {
  try {
    const data = await getTeamsData();
    res.json(data);
  } catch (err) {
    console.error("Error fetching teams data:", err);
    res.status(500).json({ error: "Failed to load teams data" });
  }
}

module.exports = {
  getTeams,
};
