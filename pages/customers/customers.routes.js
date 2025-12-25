const express = require("express");
const {
  addCustomer,
  getCustomers,
  updateCustomerById,
  deleteCustomerById,
} = require("./customers.controller");
const authenticateToken = require("../../middleware/auth");

const router = express.Router();

router.get("/", authenticateToken, getCustomers);
router.post("/", authenticateToken, addCustomer);
router.put("/:id", authenticateToken, updateCustomerById);
router.delete("/:id", authenticateToken, deleteCustomerById);

module.exports = router;
