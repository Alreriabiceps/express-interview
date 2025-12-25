const {
  createCustomer,
  listCustomers,
  updateCustomer,
  deleteCustomer,
} = require("./customers.model");

// Create customer
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
async function getCustomers(req, res) {
  try {
    const customers = await listCustomers();
    res.json(customers);
  } catch (err) {
    console.error("Error fetching customers:", err);
    res.status(500).json({ error: "Failed to load customers" });
  }
}

// Update customer
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
async function deleteCustomerById(req, res) {
  try {
    const { id } = req.params;
    const customer = await deleteCustomer(id);

    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    res.json({ message: "Customer deleted successfully", customer });
  } catch (err) {
    console.error("Error deleting customer:", err);
    res.status(500).json({ error: "Failed to delete customer" });
  }
}

module.exports = {
  addCustomer,
  getCustomers,
  updateCustomerById,
  deleteCustomerById,
};
