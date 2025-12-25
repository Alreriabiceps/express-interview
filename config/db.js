// Mongoose is a library that makes working with MongoDB easier
// It provides features like schema validation (ensuring data matches expected format)
// It also provides middleware (functions that run automatically) and simpler database operations
// Instead of writing raw MongoDB queries, we use Mongoose's simpler API
const mongoose = require('mongoose');

// This is the connection string that tells Mongoose how to connect to MongoDB
// It's like an address for the database - includes host, port, and database name
// We first check for MONGO_URI in environment variables (for production/staging)
// If not found, we default to a local MongoDB instance running on the default port
// Format: mongodb://hostname:port/database_name
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/aaaaaa_dev';

// This async function establishes a connection to the MongoDB database
// It must be called before any database operations can be performed
// The function is async because connecting to a database takes time and is asynchronous
async function connectDB() {
  try {
    // Connect to MongoDB using the connection string
    // mongoose.connect() returns a Promise, so we use await to wait for it to complete
    // The connection happens in the background, and this line waits until it's ready
    await mongoose.connect(MONGO_URI);
    
    // Extract just the database name from the full connection string for logging
    // We split the string by '/' and take the last part, which is the database name
    // This makes the log message cleaner (shows "aaaaaa_dev" instead of full connection string)
    const dbName = MONGO_URI.split('/').pop() || 'database';
    
    // Log a success message to confirm the connection was established
    // This helps verify the database connection worked when the server starts
    console.log(`MongoDB connected to database: ${dbName}`);
  } catch (err) {
    // If the connection fails (database not running, wrong credentials, network issue, etc.)
    // We catch the error and log helpful information
    console.error('MongoDB connection error:', err.message);
    console.error('Make sure MongoDB is running locally on port 27017');
    
    // Exit the Node.js process with error code 1 to indicate failure
    // This prevents the server from starting without a database connection
    // It's better to fail fast than to have a server that can't save data
    process.exit(1);
  }
}

// Export this function so it can be imported and used in server.js
// This allows server.js to call connectDB() to establish the database connection
module.exports = connectDB;


