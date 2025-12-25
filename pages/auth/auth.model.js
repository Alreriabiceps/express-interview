// Mongoose - MongoDB object modeling library
// Provides schema definition, validation, and database operations
const mongoose = require("mongoose");

// bcryptjs - password hashing library
// Securely hashes passwords so they're never stored in plain text
const bcrypt = require("bcryptjs");

// ========== USER SCHEMA DEFINITION ==========
// Defines the structure and validation rules for User documents in MongoDB
const UserSchema = new mongoose.Schema(
  {
    // Username field - must be unique, trimmed, and lowercase
    username: {
      type: String, // Data type
      required: true, // Must be provided
      unique: true, // No duplicates allowed in database
      trim: true, // Remove whitespace from start/end
      lowercase: true, // Convert to lowercase before saving
    },

    // Password field - will be hashed before saving
    password: {
      type: String,
      required: true,
      minlength: 6, // Minimum 6 characters
    },

    // Admin name - display name for the user
    adminName: {
      type: String,
      required: true,
      trim: true, // Remove whitespace
    },
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt fields
);

// ========== MIDDLEWARE (Runs automatically before saving) ==========

// Pre-save hook - runs before document is saved to database
// Automatically hashes password before storing it
UserSchema.pre("save", async function (next) {
  // Only hash password if it was modified (not on every save)
  // This prevents re-hashing already hashed passwords
  if (!this.isModified("password")) return next();

  // Hash password with bcrypt (10 = number of salt rounds, higher = more secure but slower)
  // Hash is one-way - cannot be reversed to get original password
  this.password = await bcrypt.hash(this.password, 10);

  // Call next() to continue saving process
  next();
});

// ========== INSTANCE METHODS (Available on user objects) ==========

// Method to compare provided password with stored hashed password
// Used during login to verify user entered correct password
UserSchema.methods.comparePassword = async function (candidatePassword) {
  // bcrypt.compare hashes candidatePassword and compares with stored hash
  // Returns true if passwords match, false otherwise
  return bcrypt.compare(candidatePassword, this.password);
};

// ========== CREATE MODEL ==========
// Creates User model from schema - used to interact with 'users' collection in MongoDB
const User = mongoose.model("User", UserSchema);

// ========== DATABASE OPERATION FUNCTIONS ==========

// Create new user in database
// data - object containing username, password, adminName
// Returns created user object (password will be hashed automatically)
async function createUser(data) {
  const user = await User.create({
    username: data.username,
    password: data.password, // Will be hashed by pre-save hook
    adminName: data.adminName,
  });
  return user;
}

// Find user by username
// username - username to search for
// Returns user object or null if not found
async function findUserByUsername(username) {
  // Convert to lowercase for case-insensitive search
  return User.findOne({ username: username.toLowerCase() });
}

// Find user by MongoDB ID
// id - user's _id from database
// Returns user object without password field (for security)
async function findUserById(id) {
  // .select("-password") excludes password from result
  // Prevents accidentally sending password to client
  return User.findById(id).select("-password");
}

// Update user information
// id - user's _id to update
// data - object with fields to update (adminName, username, password)
// Returns updated user object without password
async function updateUser(id, data) {
  // Build update object - only include fields that were provided
  const updateData = {};
  if (data.adminName) updateData.adminName = data.adminName;
  if (data.password) updateData.password = data.password; // Will be hashed by pre-save hook
  if (data.username) updateData.username = data.username.toLowerCase();

  // Update user and return updated document
  // new: true - return updated document instead of old one
  // runValidators: true - run schema validation on update
  const user = await User.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  }).select("-password"); // Exclude password from response

  return user;
}

// Export functions and model for use in other files
module.exports = {
  User, // Model for direct database operations if needed
  createUser, // Create new user
  findUserByUsername, // Find by username
  findUserById, // Find by ID
  updateUser, // Update user
};
