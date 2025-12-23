const { getBillingData } = require("./billing.model");

async function getBilling(req, res) {
  try {
    const data = await getBillingData();
    res.json(data);
  } catch (err) {
    console.error("Error fetching billing data:", err);
    res.status(500).json({ error: "Failed to load billing data" });
  }
}

module.exports = {
  getBilling,
};
