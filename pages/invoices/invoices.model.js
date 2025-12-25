// Mongoose - MongoDB object modeling library
const mongoose = require("mongoose");

// ========== INVOICE SCHEMA DEFINITION ==========
// Defines structure and validation for Invoice documents in MongoDB
const InvoiceSchema = new mongoose.Schema(
  {
    // Reference to Customer document
    // ObjectId - MongoDB's unique identifier type
    // ref: "Customer" - allows populating customer details
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer", // Reference to Customer model
      required: true,
    },
    
    // Unique invoice number (e.g., "INV-202401-1234")
    invoiceNumber: {
      type: String,
      required: true,
      unique: true, // No duplicate invoice numbers
    },
    
    // Invoice amount in pesos
    amount: {
      type: Number,
      required: true,
    },
    
    // Billing period (e.g., "January 2024")
    billingPeriod: {
      type: String,
      required: true,
    },
    
    // Date when payment is due
    dueDate: {
      type: Date,
      required: true,
    },
    
    // Payment status - only these values allowed
    status: {
      type: String,
      enum: ["Pending", "Paid", "Overdue"], // Only these statuses allowed
      default: "Pending", // New invoices start as Pending
    },
    
    // Date when payment was received (null if not paid)
    paymentDate: {
      type: Date,
      default: null, // No payment date until paid
    },
    
    // Method used for payment (null if not paid)
    paymentMethod: {
      type: String,
      enum: ["Cash", "Bank Transfer", "Online Payment", "Other"],
      default: null,
    },
    
    // Optional notes about the payment
    notes: {
      type: String,
      trim: true, // Remove whitespace
    },
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt fields
);

// ========== CREATE MODEL ==========
// Creates Invoice model from schema - used to interact with 'invoices' collection
const Invoice = mongoose.model("Invoice", InvoiceSchema);

// ========== DATABASE OPERATION FUNCTIONS ==========

// Create new invoice
// data - object containing invoice information
// Returns invoice with customer details populated
async function createInvoice(data) {
  // Create invoice in database
  const invoice = await Invoice.create(data);
  
  // Populate customer details - replaces customerId with actual customer data
  // Only includes specified fields (fullName, email, contactNumber, monthlyFee)
  return invoice.populate(
    "customerId",
    "fullName email contactNumber monthlyFee"
  );
}

// Get all invoices
// Returns array of all invoices with customer details
// Sorted by creation date (newest first)
async function listInvoices() {
  return Invoice.find()
    .populate("customerId", "fullName email contactNumber monthlyFee planType") // Include customer details
    .sort({ createdAt: -1 }) // Sort by newest first (-1 = descending)
    .lean(); // Return plain JavaScript objects (faster)
}

// Get single invoice by ID
// id - MongoDB _id of invoice
// Returns invoice with customer details
async function getInvoiceById(id) {
  return Invoice.findById(id)
    .populate("customerId", "fullName email contactNumber monthlyFee planType") // Include customer details
    .lean(); // Return plain JavaScript object
}

// Update invoice payment status
// id - MongoDB _id of invoice
// paymentData - object with paymentDate, paymentMethod, notes
// Marks invoice as "Paid" and records payment details
async function updateInvoicePayment(id, paymentData) {
  // Update invoice status to Paid and add payment details
  const invoice = await Invoice.findByIdAndUpdate(
    id,
    {
      status: "Paid", // Change status to Paid
      paymentDate: paymentData.paymentDate || new Date(), // Use provided date or current date
      paymentMethod: paymentData.paymentMethod, // Record payment method
      notes: paymentData.notes, // Optional payment notes
    },
    { new: true, runValidators: true } // Return updated document, run validation
  ).populate("customerId", "fullName email contactNumber monthlyFee planType"); // Include customer details

  return invoice;
}

// Delete invoice by ID
// id - MongoDB _id of invoice to delete
// Permanently removes invoice from database
async function deleteInvoice(id) {
  const invoice = await Invoice.findByIdAndDelete(id);
  return invoice;
}

// ========== UTILITY FUNCTIONS ==========

// Generate unique invoice number
// Format: INV-YYYYMM-RRRR (e.g., INV-202401-1234)
// Returns string with year, month, and random 4-digit number
function generateInvoiceNumber() {
  const date = new Date();
  const year = date.getFullYear(); // Get current year (e.g., 2024)
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Get month (01-12), pad with 0
  const random = Math.floor(Math.random() * 10000) // Random number 0-9999
    .toString()
    .padStart(4, "0"); // Pad to 4 digits (e.g., "0123")
  return `INV-${year}${month}-${random}`; // Combine into invoice number
}

// Export model and functions for use in other files
module.exports = {
  Invoice, // Model for direct database operations if needed
  createInvoice, // Create new invoice
  listInvoices, // Get all invoices
  getInvoiceById, // Get single invoice
  updateInvoicePayment, // Record payment for invoice
  deleteInvoice, // Delete invoice
  generateInvoiceNumber, // Generate unique invoice number
};
