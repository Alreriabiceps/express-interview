// Mongoose - MongoDB object modeling library
const mongoose = require("mongoose");

// ========== PLAN CONFIGURATION ==========
// Defines available internet plans with bandwidth and pricing
// Used to auto-calculate customer's bandwidth and monthly fee based on plan type
const PLAN_CONFIG = {
  Basic: { bandwidthMbps: 10, monthlyFee: 800 }, // Basic plan: 10 Mbps, ₱800/month
  Standard: { bandwidthMbps: 50, monthlyFee: 1100 }, // Standard plan: 50 Mbps, ₱1100/month
  Premium: { bandwidthMbps: 100, monthlyFee: 1400 }, // Premium plan: 100 Mbps, ₱1400/month
};

// ========== CUSTOMER SCHEMA DEFINITION ==========
// Defines structure and validation for Customer documents in MongoDB
const CustomerSchema = new mongoose.Schema(
  {
    // Customer's full name
    fullName: {
      type: String,
      required: true, // Must be provided
      trim: true, // Remove whitespace
    },

    // Street address
    addressStreet: {
      type: String,
      required: true,
      trim: true,
    },

    // City
    addressCity: {
      type: String,
      required: true,
      trim: true,
    },

    // ZIP/Postal code
    addressZip: {
      type: String,
      required: true,
      trim: true,
    },

    // Optional landmark for easier location finding
    landmark: {
      type: String,
      trim: true, // Optional field
    },

    // Phone/contact number
    contactNumber: {
      type: String,
      required: true,
      trim: true,
    },

    // Email address - stored in lowercase for consistency
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true, // Convert to lowercase before saving
    },

    // Internet plan type - must be one of the predefined options
    planType: {
      type: String,
      enum: ["Basic", "Standard", "Premium"], // Only these values allowed
      required: true,
    },

    // Internet speed in Mbps - auto-calculated from planType
    bandwidthMbps: {
      type: Number,
      required: true,
    },

    // Monthly subscription fee in pesos - auto-calculated from planType
    monthlyFee: {
      type: Number,
      required: true,
    },

    // Date when customer's subscription started
    subscriptionStartDate: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt fields
);

// ========== CREATE MODEL ==========
// Creates Customer model from schema - used to interact with 'customers' collection
const Customer = mongoose.model("Customer", CustomerSchema);

// ========== DATABASE OPERATION FUNCTIONS ==========

// Create new customer in database
// data - object containing customer information
// Auto-calculates bandwidthMbps and monthlyFee based on planType
async function createCustomer(data) {
  // Get plan configuration for the selected plan type
  const plan = PLAN_CONFIG[data.planType];

  // Validate plan type exists
  if (!plan) {
    throw new Error("Invalid plan type");
  }

  // Create customer with all data
  // bandwidthMbps and monthlyFee are calculated from PLAN_CONFIG
  const customer = await Customer.create({
    fullName: data.fullName,
    addressStreet: data.addressStreet,
    addressCity: data.addressCity,
    addressZip: data.addressZip,
    landmark: data.landmark,
    contactNumber: data.contactNumber,
    email: data.email,
    planType: data.planType,
    bandwidthMbps: plan.bandwidthMbps, // Auto-calculated from plan
    monthlyFee: plan.monthlyFee, // Auto-calculated from plan
    subscriptionStartDate: data.subscriptionStartDate,
  });
  return customer;
}

// Get list of all customers
// Returns array of all customer documents
// .lean() returns plain JavaScript objects (faster, no Mongoose methods)
async function listCustomers() {
  return Customer.find().lean();
}

// Update existing customer by ID
// id - MongoDB _id of customer to update
// data - object with fields to update
// Auto-recalculates bandwidthMbps and monthlyFee if planType changes
async function updateCustomer(id, data) {
  // Get plan configuration for validation and calculation
  const plan = PLAN_CONFIG[data.planType];
  if (!plan) {
    throw new Error("Invalid plan type");
  }

  // Update customer with new data
  // new: true - return updated document instead of old one
  // runValidators: true - run schema validation on update
  const customer = await Customer.findByIdAndUpdate(
    id,
    {
      fullName: data.fullName,
      addressStreet: data.addressStreet,
      addressCity: data.addressCity,
      addressZip: data.addressZip,
      landmark: data.landmark,
      contactNumber: data.contactNumber,
      email: data.email,
      planType: data.planType,
      bandwidthMbps: plan.bandwidthMbps, // Recalculate if plan changed
      monthlyFee: plan.monthlyFee, // Recalculate if plan changed
      subscriptionStartDate: data.subscriptionStartDate,
    },
    { new: true, runValidators: true }
  );
  return customer;
}

// Delete customer by ID
// id - MongoDB _id of customer to delete
// Permanently removes customer from database
async function deleteCustomer(id) {
  const customer = await Customer.findByIdAndDelete(id);
  return customer;
}

// Export model and functions for use in other files
module.exports = {
  Customer, // Model for direct database operations if needed
  createCustomer, // Create new customer
  listCustomers, // Get all customers
  updateCustomer, // Update customer
  deleteCustomer, // Delete customer
};
