// jsonwebtoken is a library that creates and verifies JWT (JSON Web Token) tokens
// We use it to create secure tokens that prove a user is authenticated
// These tokens are sent from the frontend with each request to prove the user is logged in
const jwt = require("jsonwebtoken");

// Import database operation functions from the auth model
// These functions handle all interactions with the users collection in MongoDB
// They abstract away the database details so the controller can focus on business logic
const {
  createUser, // Creates a new user account in the database and hashes the password
  findUserByUsername, // Finds a user by their username (used for login)
  findUserById, // Finds a user by their MongoDB ID (used to get profile)
  updateUser, // Updates user information like username, admin name, or password
} = require("./auth.model");

// This is the secret key used to sign JWT tokens when users log in
// The same secret is used to verify tokens in the authentication middleware
// In production, this MUST be stored in environment variables for security
// If this secret is exposed, attackers could create fake tokens and access the system
// The secret ensures tokens are authentic and haven't been tampered with
const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";

// This function creates a JWT token for an authenticated user
// The token contains the user's ID and is signed with our secret key
// When the user makes requests, they send this token to prove they're logged in
// userId is the MongoDB _id of the user who just logged in or registered
// The function returns a signed token string that expires in 7 days
// After 7 days, the user will need to log in again to get a new token
function generateToken(userId) {
  // jwt.sign() creates a new token with the userId stored in the payload
  // The payload is the data stored inside the token (in this case, just the userId)
  // expiresIn: "7d" means the token will be valid for 7 days, then it expires
  // Once expired, the user must log in again to get a fresh token
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
}

// This function handles user registration - creating a new user account
// It's called when someone visits POST /api/auth/register with registration data
// The request body should contain username, password, and adminName
// If successful, it creates the user account, generates a login token, and returns both
// The user is automatically logged in after registration (they get a token immediately)
async function register(req, res) {
  try {
    // Extract the registration data from the request body
    // The frontend sends this data as JSON, which Express parses into req.body
    const { username, password, adminName } = req.body;

    // Validate that all required fields were provided
    // If any field is missing, we return a 400 Bad Request error
    // This prevents creating incomplete user accounts
    if (!username || !password || !adminName) {
      return res.status(400).json({
        error: "Username, password, and admin name are required",
      });
    }

    // Validate that the password meets our security requirements
    // We require at least 6 characters to ensure passwords aren't too weak
    // This is a basic security measure - longer passwords are harder to guess
    if (password.length < 6) {
      return res.status(400).json({
        error: "Password must be at least 6 characters",
      });
    }

    // Check if a user with this username already exists in the database
    // Usernames must be unique - we can't have two users with the same username
    // If a user already exists, we return an error instead of creating a duplicate
    const existingUser = await findUserByUsername(username);
    if (existingUser) {
      return res.status(400).json({ error: "Username already exists" });
    }

    // Create the new user account in the database
    // The createUser function will automatically hash the password before saving it
    // This happens in the model's pre-save hook - we never store plain text passwords
    // The function returns the created user object with all their information
    const user = await createUser({ username, password, adminName });

    // Generate a JWT token for the newly registered user
    // This token proves the user is authenticated and allows them to access protected routes
    // We generate the token immediately so the user is automatically logged in after registration
    // The token contains the user's ID and is signed with our secret key
    const token = generateToken(user._id);

    // Return a success response with the token and user information
    // Status 201 means "Created" - the resource (user) was successfully created
    // We include the token so the frontend can store it and use it for authenticated requests
    // We only return safe user information (id, username, adminName) - never the password
    res.status(201).json({
      message: "User created successfully",
      token, // JWT token that the frontend will store and send with future requests
      user: {
        id: user._id, // User's unique ID from the database
        username: user.username, // User's username
        adminName: user.adminName, // User's display name
      },
    });
  } catch (err) {
    // If anything goes wrong during registration (database error, validation error, etc.)
    // We catch the error, log it for debugging, and return a generic error message
    // We don't expose detailed error messages to prevent information leakage
    console.error("Error registering user:", err);
    res.status(500).json({ error: "Failed to register user" });
  }
}

// This function handles user login - authenticating an existing user
// It's called when someone visits POST /api/auth/login with username and password
// The function verifies the credentials, and if correct, returns a JWT token
// The token allows the user to access protected routes without sending password every time
async function login(req, res) {
  try {
    // Extract the login credentials from the request body
    // The frontend sends username and password as JSON in the request body
    const { username, password } = req.body;

    // Validate that both username and password were provided
    // If either is missing, we return a 400 Bad Request error
    // This prevents attempting login with incomplete credentials
    if (!username || !password) {
      return res.status(400).json({
        error: "Username and password are required",
      });
    }

    // Look up the user in the database by their username
    // If the user exists, we'll get their user object; if not, we'll get null
    const user = await findUserByUsername(username);

    // If no user was found with this username, the credentials are invalid
    // We return a generic "Invalid credentials" message for security
    // We don't say "Username doesn't exist" because that would help attackers guess usernames
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Compare the provided password with the hashed password stored in the database
    // We can't decrypt the stored password, so we hash the provided password and compare
    // bcrypt.compare() does this securely - it hashes the candidate password and compares hashes
    // This returns true if passwords match, false if they don't
    const isPasswordValid = await user.comparePassword(password);

    // If the password doesn't match, the credentials are invalid
    // Again, we use a generic error message to avoid giving attackers information
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // The credentials are correct, so we generate a JWT token for this user
    // This token will be sent with future requests to prove the user is authenticated
    // The token contains the user's ID and is signed with our secret key
    const token = generateToken(user._id);

    // Return a success response with the token and user information
    // Status 200 (default) means "OK" - the request was successful
    // The frontend will store this token and send it with all future requests
    res.json({
      message: "Login successful",
      token, // JWT token that proves the user is authenticated
      user: {
        id: user._id, // User's unique ID
        username: user.username, // User's username
        adminName: user.adminName, // User's display name
      },
    });
  } catch (err) {
    // If anything goes wrong during login (database error, etc.)
    // We catch the error, log it for debugging, and return a generic error
    // This prevents exposing internal errors that could help attackers
    console.error("Error logging in:", err);
    res.status(500).json({ error: "Failed to login" });
  }
}

// This function returns the current user's profile information
// It's a protected route, meaning the user must be authenticated (have a valid token)
// The authenticateToken middleware runs first and extracts the userId from the token
// The userId is then attached to req.userId, which we use here to find the user
// This allows users to see their own profile information
async function getProfile(req, res) {
  try {
    // Find the user in the database using the ID from the JWT token
    // req.userId was set by the authenticateToken middleware after verifying the token
    // The findUserById function automatically excludes the password field for security
    // We never want to send passwords back to the client, even if they're hashed
    const user = await findUserById(req.userId);

    // If the user isn't found, something is wrong (token has valid ID but user doesn't exist)
    // This shouldn't normally happen, but we handle it gracefully
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Return the user's profile information as JSON
    // We only return safe information that the frontend needs to display
    // Never return sensitive data like passwords, even if they're hashed
    res.json({
      user: {
        id: user._id, // User's unique database ID
        username: user.username, // User's username
        adminName: user.adminName, // User's display name
      },
    });
  } catch (err) {
    // If anything goes wrong (database error, etc.), handle it gracefully
    // Log the error for debugging but return a generic message to the client
    console.error("Error fetching profile:", err);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
}

// This function allows users to update their own profile information
// It's a protected route, so the user must be authenticated with a valid token
// Users can update their admin name, username, and/or password
// If changing password, they must provide their current password for security
// The req.userId is set by the authenticateToken middleware after verifying the token
async function updateProfile(req, res) {
  try {
    // Extract the update data from the request body
    // The user can send any combination of adminName, username, password, and currentPassword
    // If password is provided, currentPassword must also be provided
    const { adminName, username, password, currentPassword } = req.body;

    // If the user wants to change their password, we need extra security
    // We require them to provide their current password to prevent unauthorized changes
    // This ensures that even if someone gets access to the account, they can't change the password without knowing it
    if (password) {
      // Require the current password to be provided when changing password
      // Without this, anyone with a valid token could change the password
      if (!currentPassword) {
        return res.status(400).json({
          error: "Current password is required to update password",
        });
      }

      // First, verify the user exists (should always be true if token is valid)
      const user = await findUserById(req.userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Get the user record with the password field included
      // findUserById excludes passwords for security, so we need to get it another way
      // We use findUserByUsername to get the full user record including the hashed password
      const userWithPassword = await findUserByUsername(user.username);

      // Verify that the provided current password matches the stored password
      // We use bcrypt to compare the passwords securely
      // This ensures the user actually knows their current password before allowing a change
      const isPasswordValid = await userWithPassword.comparePassword(
        currentPassword
      );

      // If the current password is incorrect, reject the update
      // This prevents unauthorized password changes
      if (!isPasswordValid) {
        return res.status(401).json({ error: "Current password is incorrect" });
      }
    }

    // Update the user's information in the database
    // The updateUser function will automatically hash the new password if one is provided
    // This happens in the model's pre-save hook - we never store plain text passwords
    // The function returns the updated user object
    const updatedUser = await updateUser(req.userId, {
      adminName, // New admin display name
      username, // New username
      password, // New password (will be hashed automatically)
    });

    // Return the updated user information
    // We never return passwords, even hashed ones, for security
    res.json({
      message: "Profile updated successfully",
      user: {
        id: updatedUser._id, // User's ID (unchanged)
        username: updatedUser.username, // Updated username
        adminName: updatedUser.adminName, // Updated admin name
      },
    });
  } catch (err) {
    // Handle any errors that occur during the update
    console.error("Error updating profile:", err);

    // MongoDB error code 11000 means a duplicate key violation
    // This happens when trying to set a username that already exists
    // We return a helpful error message so the user knows what went wrong
    if (err.code === 11000) {
      return res.status(400).json({ error: "Username already exists" });
    }

    // For any other errors, return a generic error message
    // This prevents exposing internal error details that could help attackers
    res.status(500).json({ error: "Failed to update profile" });
  }
}

// Export all controller functions for use in routes
module.exports = {
  register, // Create new user account
  login, // Authenticate user and return token
  getProfile, // Get current user's profile
  updateProfile, // Update current user's profile
};
