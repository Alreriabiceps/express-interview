const express = require("express");
const { getTeams } = require("./teams.controller");

const router = express.Router();

// GET /api/teams
router.get("/", getTeams);

module.exports = router;
