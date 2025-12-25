require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const customersRoutes = require("./pages/customers/customers.routes");
const authRoutes = require("./pages/auth/auth.routes");
const invoicesRoutes = require("./pages/invoices/invoices.routes");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: "http://localhost:5174",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

// Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/customers", customersRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/invoices", invoicesRoutes);

app.use("/api", (req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Start server
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
