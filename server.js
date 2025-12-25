// This loads environment variables from a .env file into process.env
// Environment variables store sensitive data like database connection strings and JWT secrets
// This keeps secrets out of the code and allows different configs for development/production
require("dotenv").config();

// Express is a web framework for Node.js that simplifies building REST APIs
// It provides routing, middleware, and request/response handling
// We use it to create our backend server that handles HTTP requests from the frontend
const express = require("express");

// CORS (Cross-Origin Resource Sharing) middleware allows the frontend to make API calls
// By default, browsers block requests from different origins (different port/domain)
// This middleware tells the browser it's safe to allow requests from our frontend URL
const cors = require("cors");

// This function connects our application to the MongoDB database
// MongoDB is a NoSQL database that stores our data (users, customers, invoices)
// The connection must be established before the server can handle database operations
const connectDB = require("./config/db");

// These are route modules that organize API endpoints by feature
// Each module handles all routes for a specific part of the application
// This keeps code organized and makes it easier to maintain
const customersRoutes = require("./pages/customers/customers.routes"); // Handles all customer-related endpoints (create, read, update, delete customers)
const authRoutes = require("./pages/auth/auth.routes"); // Handles authentication endpoints (login, register, get/update profile)
const invoicesRoutes = require("./pages/invoices/invoices.routes"); // Handles invoice-related endpoints (create invoices, record payments, etc.)

// Create an Express application instance
// This app object will handle all HTTP requests and route them to the appropriate handlers
const app = express();

// Set the server port number
// Uses PORT from environment variables if available, otherwise defaults to 5000
// Environment variables allow different ports for different environments (dev, staging, production)
const PORT = process.env.PORT || 5000;

// ========== MIDDLEWARE SETUP ==========
// Middleware functions run on every request before reaching route handlers
// They can modify requests, add data, or block requests

// CORS middleware configuration allows the frontend application to communicate with this API
// The frontend runs on http://localhost:5174 (Vite dev server default port)
// Without CORS, browsers would block these cross-origin requests for security
// We specify which origin is allowed, which HTTP methods are permitted, and which headers can be sent
app.use(
  cors({
    origin: "http://localhost:5174", // Only allow requests from this frontend URL
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"], // Allow these HTTP methods
    allowedHeaders: ["Content-Type", "Authorization"], // Allow these headers (Content-Type for JSON, Authorization for JWT tokens)
  })
);

// JSON parser middleware automatically converts JSON request bodies into JavaScript objects
// When the frontend sends JSON data, this middleware parses it and makes it available in req.body
// Without this, req.body would be undefined and we couldn't access the data sent from the frontend
app.use(express.json());

// ========== ROUTES ==========
// Routes define which URLs trigger which functions
// When a request comes in, Express matches the URL to a route and calls the associated handler

// Health check endpoint provides a simple way to verify the server is running
// This is useful for monitoring, load balancers, or quick status checks
// When you visit GET /api/health, it returns { status: "ok" } to confirm the server is alive
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Mount the customers route module at the /api/customers path
// This means all routes defined in customersRoutes will be accessible under /api/customers
// For example, GET /api/customers will list all customers, POST /api/customers will create a new customer
app.use("/api/customers", customersRoutes);

// Mount the authentication route module at the /api/auth path
// This handles all authentication-related endpoints like login, register, and profile management
// For example, POST /api/auth/login handles user login, POST /api/auth/register creates new accounts
app.use("/api/auth", authRoutes);

// Mount the invoices route module at the /api/invoices path
// This handles all invoice-related operations like creating invoices, recording payments, etc.
// For example, GET /api/invoices lists all invoices, POST /api/invoices creates a new invoice
app.use("/api/invoices", invoicesRoutes);

// Fallback route catches any API requests that don't match the routes defined above
// This provides a helpful error message instead of Express's default 404 page
// If someone requests /api/something-that-doesnt-exist, they get a JSON error response
app.use("/api", (req, res) => {
  res.status(404).json({ error: "Not found" });
});

// ========== SERVER STARTUP ==========

// This async function starts the server by first connecting to the database, then listening for requests
// It's async because database connection is an asynchronous operation that takes time
// We must wait for the database connection before starting the server to ensure we can handle requests
async function startServer() {
  try {
    // Connect to MongoDB database before starting the server
    // This ensures the database is ready when the first request comes in
    // If the database isn't running, this will throw an error and prevent the server from starting
    await connectDB();
    
    // Start the Express server listening on the specified port
    // Once this is called, the server begins accepting HTTP requests
    // The callback function runs when the server successfully starts listening
    app.listen(PORT, () => {
      console.log(`Backend server running on port ${PORT}`);
    });
  } catch (err) {
    // If anything goes wrong during startup (usually database connection failure)
    // Log the error so we know what went wrong
    console.error("Failed to start server:", err);
    
    // Exit the Node.js process with error code 1
    // This prevents the server from running in a broken state
    // Error code 1 indicates failure (0 would indicate success)
    process.exit(1);
  }
}

// Call the startServer function to begin the application
// This is the entry point that gets everything running
startServer();
