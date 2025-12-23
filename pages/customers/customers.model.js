const mongoose = require("mongoose");

// Simple plan configuration – adjust values as needed
const PLAN_CONFIG = {
  Basic: { bandwidthMbps: 10, monthlyFee: 800 },
  Standard: { bandwidthMbps: 50, monthlyFee: 1100 },
  Premium: { bandwidthMbps: 100, monthlyFee: 1400 },
};

const CustomerSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    addressStreet: {
      type: String,
      required: true,
      trim: true,
    },
    addressCity: {
      type: String,
      required: true,
      trim: true,
    },
    addressZip: {
      type: String,
      required: true,
      trim: true,
    },
    landmark: {
      type: String,
      trim: true,
    },
    contactNumber: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    planType: {
      type: String,
      enum: ["Basic", "Standard", "Premium"],
      required: true,
    },
    bandwidthMbps: {
      type: Number,
      required: true,
    },
    monthlyFee: {
      type: Number,
      required: true,
    },
    subscriptionStartDate: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

const Customer = mongoose.model("Customer", CustomerSchema);

async function createCustomer(data) {
  const plan = PLAN_CONFIG[data.planType];
  if (!plan) {
    throw new Error("Invalid plan type");
  }

  const customer = await Customer.create({
    fullName: data.fullName,
    addressStreet: data.addressStreet,
    addressCity: data.addressCity,
    addressZip: data.addressZip,
    landmark: data.landmark,
    contactNumber: data.contactNumber,
    email: data.email,
    planType: data.planType,
    bandwidthMbps: plan.bandwidthMbps,
    monthlyFee: plan.monthlyFee,
    subscriptionStartDate: data.subscriptionStartDate,
  });
  return customer;
}

async function listCustomers() {
  return Customer.find().lean();
}

async function updateCustomer(id, data) {
  const plan = PLAN_CONFIG[data.planType];
  if (!plan) {
    throw new Error("Invalid plan type");
  }

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
      bandwidthMbps: plan.bandwidthMbps,
      monthlyFee: plan.monthlyFee,
      subscriptionStartDate: data.subscriptionStartDate,
    },
    { new: true, runValidators: true }
  );
  return customer;
}

async function deleteCustomer(id) {
  const customer = await Customer.findByIdAndDelete(id);
  return customer;
}

module.exports = {
  Customer,
  createCustomer,
  listCustomers,
  updateCustomer,
  deleteCustomer,
};
