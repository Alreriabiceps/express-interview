// Import database operation functions from model
// These handle all database interactions for invoices
const {
  createInvoice, // Create new invoice
  listInvoices, // Get all invoices
  getInvoiceById, // Get single invoice
  updateInvoicePayment, // Record payment
  deleteInvoice, // Delete invoice
  generateInvoiceNumber, // Generate unique invoice number
} = require("./invoices.model");

// ========== CONTROLLER FUNCTIONS ==========
// These functions handle HTTP requests and responses

// Create new invoice
// POST /api/invoices
// req.body - contains customerId, amount, billingPeriod, dueDate
// res - response object to send back created invoice
async function addInvoice(req, res) {
  try {
    // Extract invoice data from request body
    const { customerId, amount, billingPeriod, dueDate } = req.body;

    // Validate required fields are provided
    if (!customerId || !amount || !billingPeriod || !dueDate) {
      return res.status(400).json({
        error: "customerId, amount, billingPeriod, and dueDate are required",
      });
    }

    // Generate unique invoice number (e.g., "INV-202401-1234")
    const invoiceNumber = generateInvoiceNumber();
    
    // Create invoice in database
    // Status defaults to "Pending" (set in schema)
    const invoice = await createInvoice({
      customerId,
      invoiceNumber,
      amount,
      billingPeriod,
      dueDate: new Date(dueDate), // Convert string to Date object
      status: "Pending", // New invoices start as Pending
    });

    // Return created invoice with customer details populated
    res.status(201).json(invoice);
  } catch (err) {
    // Handle errors
    console.error("Error creating invoice:", err);
    
    // MongoDB duplicate key error (invoice number already exists - very rare)
    if (err.code === 11000) {
      return res.status(400).json({ error: "Invoice number already exists" });
    }
    
    // Other errors
    res.status(500).json({ error: "Failed to create invoice" });
  }
}

// Get all invoices
// GET /api/invoices
// Returns array of all invoices with customer details
async function getInvoices(req, res) {
  try {
    // Get all invoices from database (sorted by newest first)
    const invoices = await listInvoices();
    
    // Return invoices as JSON
    res.json(invoices);
  } catch (err) {
    // Handle errors
    console.error("Error fetching invoices:", err);
    res.status(500).json({ error: "Failed to load invoices" });
  }
}

// Get single invoice by ID
// GET /api/invoices/:id
// req.params.id - invoice ID from URL
// Returns one invoice with customer details
async function getInvoice(req, res) {
  try {
    // Get invoice ID from URL parameters
    const { id } = req.params;
    
    // Find invoice by ID
    const invoice = await getInvoiceById(id);

    // If invoice not found, return 404 error
    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    // Return invoice as JSON
    res.json(invoice);
  } catch (err) {
    // Handle errors
    console.error("Error fetching invoice:", err);
    res.status(500).json({ error: "Failed to load invoice" });
  }
}

// Record payment for invoice
// PUT /api/invoices/:id/payment
// req.params.id - invoice ID from URL
// req.body - contains paymentDate, paymentMethod, notes
// Marks invoice as "Paid" and records payment details
async function recordPayment(req, res) {
  try {
    // Get invoice ID from URL parameters
    const { id } = req.params;
    
    // Extract payment data from request body
    const { paymentDate, paymentMethod, notes } = req.body;

    // Validate payment method is provided
    if (!paymentMethod) {
      return res.status(400).json({ error: "Payment method is required" });
    }

    // Update invoice with payment information
    // Marks status as "Paid" and records payment details
    const invoice = await updateInvoicePayment(id, {
      paymentDate: paymentDate ? new Date(paymentDate) : new Date(), // Use provided date or current date
      paymentMethod,
      notes,
    });

    // If invoice not found, return 404 error
    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    // Return updated invoice
    res.json(invoice);
  } catch (err) {
    // Handle errors
    console.error("Error recording payment:", err);
    res.status(500).json({ error: "Failed to record payment" });
  }
}

// Delete invoice
// DELETE /api/invoices/:id
// req.params.id - invoice ID from URL
// Permanently removes invoice from database
async function deleteInvoiceById(req, res) {
  try {
    // Get invoice ID from URL parameters
    const { id } = req.params;
    
    // Delete invoice from database
    const invoice = await deleteInvoice(id);

    // If invoice not found, return 404 error
    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    // Return success message with deleted invoice data
    res.json({ message: "Invoice deleted successfully", invoice });
  } catch (err) {
    // Handle errors
    console.error("Error deleting invoice:", err);
    res.status(500).json({ error: "Failed to delete invoice" });
  }
}

// Generate invoices for all customers for a billing period
// POST /api/invoices/generate-monthly
// req.body - contains billingPeriod and dueDate
// Creates invoices for all customers who don't already have one for this period
// Useful for monthly billing automation
async function generateMonthlyInvoices(req, res) {
  try {
    // Extract billing period and due date from request body
    const { billingPeriod, dueDate } = req.body;
    
    // Import Customer model to access all customers
    const Customer = require("../customers/customers.model").Customer;

    // Validate required fields
    if (!billingPeriod || !dueDate) {
      return res.status(400).json({
        error: "billingPeriod and dueDate are required",
      });
    }

    // Get all customers from database
    const customers = await Customer.find().lean();

    // If no customers exist, return error
    if (customers.length === 0) {
      return res.status(400).json({ error: "No customers found" });
    }

    // Get all existing invoices to check for duplicates
    const existingInvoices = await listInvoices();
    
    // Extract customer IDs who already have invoices for this billing period
    // Only check Pending invoices (don't create duplicate if already paid)
    const existingCustomerIds = existingInvoices
      .filter(
        (inv) => inv.billingPeriod === billingPeriod && inv.status === "Pending"
      )
      .map(
        (inv) => inv.customerId._id?.toString() || inv.customerId.toString()
      );

    // Filter customers who don't have an invoice for this period yet
    // Only create invoices for customers who need one
    const invoicesToCreate = customers.filter(
      (customer) => !existingCustomerIds.includes(customer._id.toString())
    );

    // If all customers already have invoices, return early
    if (invoicesToCreate.length === 0) {
      return res.json({
        message: "All customers already have invoices for this billing period",
        created: 0,
        skipped: customers.length,
      });
    }

    // Create invoices for each customer who needs one
    const createdInvoices = [];
    for (const customer of invoicesToCreate) {
      try {
        // Generate unique invoice number
        const invoiceNumber = generateInvoiceNumber();
        
        // Create invoice with customer's monthly fee as amount
        const invoice = await createInvoice({
          customerId: customer._id,
          invoiceNumber,
          amount: customer.monthlyFee, // Use customer's monthly fee
          billingPeriod,
          dueDate: new Date(dueDate),
          status: "Pending", // New invoices start as Pending
        });
        createdInvoices.push(invoice);
      } catch (err) {
        // If one invoice fails, log error but continue with others
        // Prevents one failure from stopping entire batch
        console.error(
          `Error creating invoice for customer ${customer._id}:`,
          err
        );
      }
    }

    // Return summary of created invoices
    res.status(201).json({
      message: `Successfully created ${createdInvoices.length} invoices`,
      created: createdInvoices.length, // Number successfully created
      skipped: customers.length - createdInvoices.length, // Number skipped (already had invoice or failed)
      invoices: createdInvoices, // Array of created invoices
    });
  } catch (err) {
    // Handle errors
    console.error("Error generating monthly invoices:", err);
    res.status(500).json({ error: "Failed to generate monthly invoices" });
  }
}

// Export all controller functions for use in routes
module.exports = {
  addInvoice, // Create single invoice
  getInvoices, // Get all invoices
  getInvoice, // Get single invoice
  recordPayment, // Record payment
  deleteInvoiceById, // Delete invoice
  generateMonthlyInvoices, // Bulk create invoices
};
