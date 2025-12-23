const express = require("express");
const { getHomepage } = require("./homepage.controller");

const router = express.Router();

// GET /api/homepage
router.get("/", getHomepage);

module.exports = router;
