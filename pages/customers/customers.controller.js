// Import database operation functions from model
// These handle all database interactions for customers
const {
  createCustomer, // Create new customer
  listCustomers, // Get all customers
  updateCustomer, // Update customer
  deleteCustomer, // Delete customer
} = require("./customers.model");

// ========== CONTROLLER FUNCTIONS ==========
// These functions handle HTTP requests and responses
// They validate input, call model functions, and send responses

// Create new customer
// POST /api/customers
// req - request object with customer data in body
// res - response object to send back result
async function addCustomer(req, res) {
  try {
    const {
      fullName,
      addressStreet,
      addressCity,
      addressZip,
      landmark,
      contactNumber,
      email,
      planType,
      subscriptionStartDate,
    } = req.body;

    if (
      !fullName ||
      !addressStreet ||
      !addressCity ||
      !addressZip ||
      !contactNumber ||
      !email ||
      !planType ||
      !subscriptionStartDate
    ) {
      return res.status(400).json({
        error:
          "fullName, addressStreet, addressCity, addressZip, contactNumber, email, planType and subscriptionStartDate are required",
      });
    }

    const customer = await createCustomer({
      fullName,
      addressStreet,
      addressCity,
      addressZip,
      landmark,
      contactNumber,
      email,
      planType,
      subscriptionStartDate: new Date(subscriptionStartDate),
    });

    res.status(201).json(customer);
  } catch (err) {
    console.error("Error creating customer:", err);
    res.status(500).json({ error: "Failed to create customer" });
  }
}

// Get all customers
// GET /api/customers
// Returns array of all customer records
async function getCustomers(req, res) {
  try {
    // Get all customers from database
    const customers = await listCustomers();
    
    // Return customers as JSON
    res.json(customers);
  } catch (err) {
    // Handle errors
    console.error("Error fetching customers:", err);
    res.status(500).json({ error: "Failed to load customers" });
  }
}

// Update existing customer
// PUT /api/customers/:id
// req.params.id - customer ID from URL
// req.body - updated customer data
async function updateCustomerById(req, res) {
  try {
    const { id } = req.params;
    const {
      fullName,
      addressStreet,
      addressCity,
      addressZip,
      landmark,
      contactNumber,
      email,
      planType,
      subscriptionStartDate,
    } = req.body;

    if (
      !fullName ||
      !addressStreet ||
      !addressCity ||
      !addressZip ||
      !contactNumber ||
      !email ||
      !planType ||
      !subscriptionStartDate
    ) {
      return res.status(400).json({
        error:
          "fullName, addressStreet, addressCity, addressZip, contactNumber, email, planType and subscriptionStartDate are required",
      });
    }

    const customer = await updateCustomer(id, {
      fullName,
      addressStreet,
      addressCity,
      addressZip,
      landmark,
      contactNumber,
      email,
      planType,
      subscriptionStartDate: new Date(subscriptionStartDate),
    });

    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    res.json(customer);
  } catch (err) {
    console.error("Error updating customer:", err);
    res.status(500).json({ error: "Failed to update customer" });
  }
}

// Delete customer
// DELETE /api/customers/:id
// req.params.id - customer ID from URL
// Permanently removes customer from database
async function deleteCustomerById(req, res) {
  try {
    // Get customer ID from URL parameters
    const { id } = req.params;
    
    // Delete customer from database
    const customer = await deleteCustomer(id);

    // If customer not found, return 404 error
    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    // Return success message with deleted customer data
    res.json({ message: "Customer deleted successfully", customer });
  } catch (err) {
    // Handle errors
    console.error("Error deleting customer:", err);
    res.status(500).json({ error: "Failed to delete customer" });
  }
}

// Export all controller functions for use in routes
module.exports = {
  addCustomer, // Create customer
  getCustomers, // Get all customers
  updateCustomerById, // Update customer
  deleteCustomerById, // Delete customer
};
