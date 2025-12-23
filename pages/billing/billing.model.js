const mongoose = require("mongoose");

const BillingSchema = new mongoose.Schema(
  {
    plan: {
      type: String,
      required: true,
      default: "free",
    },
    nextInvoiceDate: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const Billing = mongoose.model("Billing", BillingSchema);

async function getBillingData() {
  let doc = await Billing.findOne();
  if (!doc) {
    // Seed a default document on first read
    doc = await Billing.create({});
  }
  return doc;
}

module.exports = {
  Billing,
  getBillingData,
};
