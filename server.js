require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

// Import per-page route modules
const homepageRoutes = require("./pages/homepage/homepage.routes");
const billingRoutes = require("./pages/billing/billing.routes");
const teamsRoutes = require("./pages/teams/teams.routes");
const customersRoutes = require("./pages/customers/customers.routes");
const authRoutes = require("./pages/auth/auth.routes");
const invoicesRoutes = require("./pages/invoices/invoices.routes");

const app = express();
const PORT = process.env.PORT || 5000;

// Basic middleware
// Allow frontend (Vite dev server) to call this API
app.use(
  cors({
    origin: "http://localhost:5174",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

// Simple health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Mount per-page routers
app.use("/api/homepage", homepageRoutes);
app.use("/api/billing", billingRoutes);
app.use("/api/teams", teamsRoutes);
app.use("/api/customers", customersRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/invoices", invoicesRoutes);

// Fallback for unknown API routes
// Express 5 no longer supports bare wildcards like `/api/*` with path-to-regexp v6.
// Using the `/api` prefix here will match any API route that wasn't handled above.
app.use("/api", (req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Connect to MongoDB and start server
async function startServer() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Backend server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

startServer();
