// Express Router - creates modular route handlers for invoice operations
const express = require("express");

// Import controller functions - business logic for invoice operations
// addInvoice - creates a new invoice for a customer
// getInvoices - retrieves list of all invoices
// getInvoice - gets single invoice by ID
// recordPayment - marks invoice as paid and records payment details
// deleteInvoiceById - deletes invoice by ID
// generateMonthlyInvoices - bulk creates invoices for all customers
const {
  addInvoice,
  getInvoices,
  getInvoice,
  recordPayment,
  deleteInvoiceById,
  generateMonthlyInvoices,
} = require("./invoices.controller");

// Import authentication middleware - protects all invoice routes
const authenticateToken = require("../../middleware/auth");

// Create router instance - handles routes for /api/invoices
const router = express.Router();

// ========== ALL ROUTES REQUIRE AUTHENTICATION ==========

// GET /api/invoices - List all invoices
// Returns array of all invoices with customer details populated
router.get("/", authenticateToken, getInvoices);

// POST /api/invoices/generate-monthly - Generate invoices for all customers
// IMPORTANT: Must be defined before /:id route to avoid route conflict
// Creates invoices for current month for all customers who don't have one
// Returns count of created and skipped invoices
router.post("/generate-monthly", authenticateToken, generateMonthlyInvoices);

// GET /api/invoices/:id - Get single invoice by ID
// :id is URL parameter (e.g., /api/invoices/123)
// Returns one invoice with customer details
router.get("/:id", authenticateToken, getInvoice);

// POST /api/invoices - Create new invoice
// Request body contains customerId, amount, billingPeriod, dueDate
// Creates invoice and returns it with customer details
router.post("/", authenticateToken, addInvoice);

// PUT /api/invoices/:id/payment - Record payment for invoice
// Marks invoice as "Paid" and stores payment date, method, notes
// :id identifies which invoice to update
router.put("/:id/payment", authenticateToken, recordPayment);

// DELETE /api/invoices/:id - Delete invoice
// :id identifies which invoice to permanently remove
router.delete("/:id", authenticateToken, deleteInvoiceById);

// Export router so it can be mounted in server.js
module.exports = router;
