// jsonwebtoken is a library that creates and verifies JWT (JSON Web Token) tokens
// JWT tokens are a secure way to transmit user identity information between the frontend and backend
// Instead of sending username/password with every request, we send a token that proves the user is authenticated
// The token contains encrypted information about the user (like their user ID) that can be verified
const jwt = require("jsonwebtoken");

// This is the secret key used to sign (create) and verify (validate) JWT tokens
// The same secret must be used to create and verify tokens - think of it like a password
// In production, this MUST be stored in environment variables, never hardcoded in the code
// If someone gets this secret, they could create fake tokens and access the system
// The secret ensures tokens haven't been tampered with - if someone modifies a token, verification will fail
const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";

// This is a middleware function that runs before protected route handlers
// Its job is to verify that the user making the request is authenticated
// It checks for a JWT token in the request headers and validates it
// If the token is valid, it allows the request to continue; if not, it blocks the request
// req contains information about the incoming request
// res is used to send responses back to the client
// next is a function that passes control to the next middleware or route handler
function authenticateToken(req, res, next) {
  // Get the Authorization header from the incoming request
  // The frontend sends the token in this header in the format "Bearer <token>"
  // This is a standard way to send authentication tokens in HTTP requests
  const authHeader = req.headers["authorization"];

  // Extract the actual token from the "Bearer TOKEN" format
  // The header looks like "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  // We split by space and take the second part (index 1) to get just the token
  // If authHeader is null/undefined, the && operator short-circuits and token becomes null
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  // If no token was provided in the request, the user is not authenticated
  // Return a 401 Unauthorized status code with an error message
  // This tells the frontend that authentication is required to access this resource
  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  // Verify the token using the secret key to ensure it's valid and hasn't been tampered with
  // jwt.verify() checks if the token was signed with our secret and if it's expired
  // If valid, decoded will contain the token payload (the data we stored when creating the token)
  // If invalid or expired, err will contain error information
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    // If the token is invalid, expired, or was signed with a different secret
    if (err) {
      // Return a 403 Forbidden status code
      // 403 means the request was understood but access is denied (different from 401 which means not authenticated)
      return res.status(403).json({ error: "Invalid or expired token" });
    }

    // The token is valid, so we extract the userId from the decoded token payload
    // We attach it to the request object so route handlers can access it
    // This way, route handlers know which user made the request without having to decode the token again
    req.userId = decoded.userId;

    // Call next() to pass control to the next middleware or the actual route handler
    // Without calling next(), the request would hang and never reach the route handler
    // This is how Express middleware chains work - each middleware calls next() to continue
    next();
  });
}

// Export this middleware function so it can be imported and used in route files
// Route files can then use it to protect routes by adding it as a parameter: router.get("/path", authenticateToken, handler)
module.exports = authenticateToken;
