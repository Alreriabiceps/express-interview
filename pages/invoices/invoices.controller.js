const {
  createInvoice,
  listInvoices,
  getInvoiceById,
  updateInvoicePayment,
  deleteInvoice,
  generateInvoiceNumber,
} = require("./invoices.model");

async function addInvoice(req, res) {
  try {
    const { customerId, amount, billingPeriod, dueDate } = req.body;

    if (!customerId || !amount || !billingPeriod || !dueDate) {
      return res.status(400).json({
        error: "customerId, amount, billingPeriod, and dueDate are required",
      });
    }

    const invoiceNumber = generateInvoiceNumber();
    const invoice = await createInvoice({
      customerId,
      invoiceNumber,
      amount,
      billingPeriod,
      dueDate: new Date(dueDate),
      status: "Pending",
    });

    res.status(201).json(invoice);
  } catch (err) {
    console.error("Error creating invoice:", err);
    if (err.code === 11000) {
      return res.status(400).json({ error: "Invoice number already exists" });
    }
    res.status(500).json({ error: "Failed to create invoice" });
  }
}

async function getInvoices(req, res) {
  try {
    const invoices = await listInvoices();
    res.json(invoices);
  } catch (err) {
    console.error("Error fetching invoices:", err);
    res.status(500).json({ error: "Failed to load invoices" });
  }
}

async function getInvoice(req, res) {
  try {
    const { id } = req.params;
    const invoice = await getInvoiceById(id);

    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    res.json(invoice);
  } catch (err) {
    console.error("Error fetching invoice:", err);
    res.status(500).json({ error: "Failed to load invoice" });
  }
}

async function recordPayment(req, res) {
  try {
    const { id } = req.params;
    const { paymentDate, paymentMethod, notes } = req.body;

    if (!paymentMethod) {
      return res.status(400).json({ error: "Payment method is required" });
    }

    const invoice = await updateInvoicePayment(id, {
      paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
      paymentMethod,
      notes,
    });

    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    res.json(invoice);
  } catch (err) {
    console.error("Error recording payment:", err);
    res.status(500).json({ error: "Failed to record payment" });
  }
}

async function deleteInvoiceById(req, res) {
  try {
    const { id } = req.params;
    const invoice = await deleteInvoice(id);

    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    res.json({ message: "Invoice deleted successfully", invoice });
  } catch (err) {
    console.error("Error deleting invoice:", err);
    res.status(500).json({ error: "Failed to delete invoice" });
  }
}

async function generateMonthlyInvoices(req, res) {
  try {
    const { billingPeriod, dueDate } = req.body;
    const Customer = require("../customers/customers.model").Customer;

    if (!billingPeriod || !dueDate) {
      return res.status(400).json({
        error: "billingPeriod and dueDate are required",
      });
    }

    // Get all customers
    const customers = await Customer.find().lean();

    if (customers.length === 0) {
      return res.status(400).json({ error: "No customers found" });
    }

    // Check for existing invoices for this billing period
    const existingInvoices = await listInvoices();
    const existingCustomerIds = existingInvoices
      .filter(
        (inv) => inv.billingPeriod === billingPeriod && inv.status === "Pending"
      )
      .map(
        (inv) => inv.customerId._id?.toString() || inv.customerId.toString()
      );

    // Create invoices for customers who don't have one for this period
    const invoicesToCreate = customers.filter(
      (customer) => !existingCustomerIds.includes(customer._id.toString())
    );

    if (invoicesToCreate.length === 0) {
      return res.json({
        message: "All customers already have invoices for this billing period",
        created: 0,
        skipped: customers.length,
      });
    }

    const createdInvoices = [];
    for (const customer of invoicesToCreate) {
      try {
        const invoiceNumber = generateInvoiceNumber();
        const invoice = await createInvoice({
          customerId: customer._id,
          invoiceNumber,
          amount: customer.monthlyFee,
          billingPeriod,
          dueDate: new Date(dueDate),
          status: "Pending",
        });
        createdInvoices.push(invoice);
      } catch (err) {
        console.error(
          `Error creating invoice for customer ${customer._id}:`,
          err
        );
      }
    }

    res.status(201).json({
      message: `Successfully created ${createdInvoices.length} invoices`,
      created: createdInvoices.length,
      skipped: customers.length - createdInvoices.length,
      invoices: createdInvoices,
    });
  } catch (err) {
    console.error("Error generating monthly invoices:", err);
    res.status(500).json({ error: "Failed to generate monthly invoices" });
  }
}

module.exports = {
  addInvoice,
  getInvoices,
  getInvoice,
  recordPayment,
  deleteInvoiceById,
  generateMonthlyInvoices,
};
