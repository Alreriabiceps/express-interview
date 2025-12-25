const express = require("express");
const {
  register,
  login,
  getProfile,
  updateProfile,
} = require("./auth.controller");
const authenticateToken = require("../../middleware/auth");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/profile", authenticateToken, getProfile);
router.put("/profile", authenticateToken, updateProfile);

module.exports = router;
