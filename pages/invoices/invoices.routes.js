const express = require("express");
const {
  addInvoice,
  getInvoices,
  getInvoice,
  recordPayment,
  deleteInvoiceById,
  generateMonthlyInvoices,
} = require("./invoices.controller");

const router = express.Router();

// GET /api/invoices - list all invoices
router.get("/", getInvoices);

// GET /api/invoices/:id - get single invoice
router.get("/:id", getInvoice);

// POST /api/invoices - create new invoice
router.post("/", addInvoice);

// POST /api/invoices/generate-monthly - generate invoices for all customers
router.post("/generate-monthly", generateMonthlyInvoices);

// PUT /api/invoices/:id/payment - record payment for invoice
router.put("/:id/payment", recordPayment);

// DELETE /api/invoices/:id - delete invoice
router.delete("/:id", deleteInvoiceById);

module.exports = router;
