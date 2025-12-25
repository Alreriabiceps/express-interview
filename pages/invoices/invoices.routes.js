const express = require("express");
const {
  addInvoice,
  getInvoices,
  getInvoice,
  recordPayment,
  deleteInvoiceById,
  generateMonthlyInvoices,
} = require("./invoices.controller");
const authenticateToken = require("../../middleware/auth");

const router = express.Router();

router.get("/", authenticateToken, getInvoices);
router.post("/generate-monthly", authenticateToken, generateMonthlyInvoices);
router.get("/:id", authenticateToken, getInvoice);
router.post("/", authenticateToken, addInvoice);
router.put("/:id/payment", authenticateToken, recordPayment);
router.delete("/:id", authenticateToken, deleteInvoiceById);

module.exports = router;
