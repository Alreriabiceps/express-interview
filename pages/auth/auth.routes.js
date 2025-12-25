// Express Router - creates modular route handlers
// Allows grouping related routes together
const express = require("express");

// Import controller functions - these contain the actual logic for each route
// register - creates new user account
// login - authenticates user and returns JWT token
// getProfile - gets current user's profile information
// updateProfile - updates user's profile (name, username, password)
const {
  register,
  login,
  getProfile,
  updateProfile,
} = require("./auth.controller");

// Import authentication middleware - verifies JWT token
// Protects routes so only authenticated users can access them
const authenticateToken = require("../../middleware/auth");

// Create router instance - handles routes for /api/auth
const router = express.Router();

// ========== PUBLIC ROUTES (No authentication required) ==========

// POST /api/auth/register - Create new user account
// Anyone can register, no token needed
router.post("/register", register);

// POST /api/auth/login - Login and get JWT token
// Returns token that must be used for protected routes
router.post("/login", login);

// ========== PROTECTED ROUTES (Authentication required) ==========

// GET /api/auth/profile - Get current user's profile
// authenticateToken middleware runs first - verifies token before allowing access
// If token invalid, returns 401/403 error
router.get("/profile", authenticateToken, getProfile);

// PUT /api/auth/profile - Update current user's profile
// Requires valid token + current password if changing password
router.put("/profile", authenticateToken, updateProfile);

// Export router so it can be mounted in server.js
module.exports = router;
