const express = require("express");
const {
  addCustomer,
  getCustomers,
  updateCustomerById,
  deleteCustomerById,
} = require("./customers.controller");

const router = express.Router();

// GET /api/customers - list all customers
router.get("/", getCustomers);

// POST /api/customers - add a new customer
router.post("/", addCustomer);

// PUT /api/customers/:id - update a customer
router.put("/:id", updateCustomerById);

// DELETE /api/customers/:id - delete a customer
router.delete("/:id", deleteCustomerById);

module.exports = router;
