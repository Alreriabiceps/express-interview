// Express Router - creates modular route handlers for customer operations
const express = require("express");

// Import controller functions - business logic for customer operations
// addCustomer - creates a new customer record
// getCustomers - retrieves list of all customers
// updateCustomerById - updates existing customer by ID
// deleteCustomerById - deletes customer by ID
const {
  addCustomer,
  getCustomers,
  updateCustomerById,
  deleteCustomerById,
} = require("./customers.controller");

// Import authentication middleware - protects all customer routes
// Ensures only logged-in users can access customer data
const authenticateToken = require("../../middleware/auth");

// Create router instance - handles routes for /api/customers
const router = express.Router();

// ========== ALL ROUTES REQUIRE AUTHENTICATION ==========

// GET /api/customers - List all customers
// Returns array of all customer records
// authenticateToken runs first to verify user is logged in
router.get("/", authenticateToken, getCustomers);

// POST /api/customers - Create a new customer
// Request body contains customer details (name, address, plan, etc.)
// Creates customer and returns the created record
router.post("/", authenticateToken, addCustomer);

// PUT /api/customers/:id - Update existing customer
// :id is URL parameter (e.g., /api/customers/123)
// Updates customer with new data from request body
router.put("/:id", authenticateToken, updateCustomerById);

// DELETE /api/customers/:id - Delete customer
// :id is URL parameter identifying which customer to delete
// Permanently removes customer from database
router.delete("/:id", authenticateToken, deleteCustomerById);

// Export router so it can be mounted in server.js
module.exports = router;
