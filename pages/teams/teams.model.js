const mongoose = require("mongoose");

const TeamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Team = mongoose.model("Team", TeamSchema);

async function getTeamsData() {
  const teams = await Team.find().lean();
  return teams;
}

module.exports = {
  Team,
  getTeamsData,
};
