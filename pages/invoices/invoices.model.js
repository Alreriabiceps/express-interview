const mongoose = require("mongoose");

// Invoice schema
const InvoiceSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    billingPeriod: {
      type: String,
      required: true,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Paid", "Overdue"],
      default: "Pending",
    },
    paymentDate: {
      type: Date,
      default: null,
    },
    paymentMethod: {
      type: String,
      enum: ["Cash", "Bank Transfer", "Online Payment", "Other"],
      default: null,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

const Invoice = mongoose.model("Invoice", InvoiceSchema);

// Create invoice
async function createInvoice(data) {
  const invoice = await Invoice.create(data);
  return invoice.populate(
    "customerId",
    "fullName email contactNumber monthlyFee"
  );
}

// Get all invoices
async function listInvoices() {
  return Invoice.find()
    .populate("customerId", "fullName email contactNumber monthlyFee planType")
    .sort({ createdAt: -1 })
    .lean();
}

// Get invoice by ID
async function getInvoiceById(id) {
  return Invoice.findById(id)
    .populate("customerId", "fullName email contactNumber monthlyFee planType")
    .lean();
}

// Update invoice payment
async function updateInvoicePayment(id, paymentData) {
  const invoice = await Invoice.findByIdAndUpdate(
    id,
    {
      status: "Paid",
      paymentDate: paymentData.paymentDate || new Date(),
      paymentMethod: paymentData.paymentMethod,
      notes: paymentData.notes,
    },
    { new: true, runValidators: true }
  ).populate("customerId", "fullName email contactNumber monthlyFee planType");

  return invoice;
}

// Delete invoice
async function deleteInvoice(id) {
  const invoice = await Invoice.findByIdAndDelete(id);
  return invoice;
}

// Generate invoice number
function generateInvoiceNumber() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `INV-${year}${month}-${random}`;
}

module.exports = {
  Invoice,
  createInvoice,
  listInvoices,
  getInvoiceById,
  updateInvoicePayment,
  deleteInvoice,
  generateInvoiceNumber,
};
