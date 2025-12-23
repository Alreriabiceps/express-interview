const express = require("express");
const { getBilling } = require("./billing.controller");

const router = express.Router();

// GET /api/billing
router.get("/", getBilling);

module.exports = router;
