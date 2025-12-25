const jwt = require("jsonwebtoken");
const {
  createUser,
  findUserByUsername,
  findUserById,
  updateUser,
} = require("./auth.model");

const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";

// Generate JWT token
function generateToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
}

// Register user
async function register(req, res) {
  try {
    const { username, password, adminName } = req.body;

    if (!username || !password || !adminName) {
      return res.status(400).json({
        error: "Username, password, and admin name are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: "Password must be at least 6 characters",
      });
    }

    const existingUser = await findUserByUsername(username);
    if (existingUser) {
      return res.status(400).json({ error: "Username already exists" });
    }

    const user = await createUser({ username, password, adminName });
    const token = generateToken(user._id);

    res.status(201).json({
      message: "User created successfully",
      token,
      user: {
        id: user._id,
        username: user.username,
        adminName: user.adminName,
      },
    });
  } catch (err) {
    console.error("Error registering user:", err);
    res.status(500).json({ error: "Failed to register user" });
  }
}

// Login user
async function login(req, res) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        error: "Username and password are required",
      });
    }

    const user = await findUserByUsername(username);
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = generateToken(user._id);

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        adminName: user.adminName,
      },
    });
  } catch (err) {
    console.error("Error logging in:", err);
    res.status(500).json({ error: "Failed to login" });
  }
}

// Get user profile
async function getProfile(req, res) {
  try {
    const user = await findUserById(req.userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      user: {
        id: user._id,
        username: user.username,
        adminName: user.adminName,
      },
    });
  } catch (err) {
    console.error("Error fetching profile:", err);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
}

// Update user profile
async function updateProfile(req, res) {
  try {
    const { adminName, username, password, currentPassword } = req.body;

    if (password) {
      if (!currentPassword) {
        return res.status(400).json({
          error: "Current password is required to update password",
        });
      }

      const user = await findUserById(req.userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const userWithPassword = await findUserByUsername(user.username);
      const isPasswordValid = await userWithPassword.comparePassword(
        currentPassword
      );

      if (!isPasswordValid) {
        return res.status(401).json({ error: "Current password is incorrect" });
      }
    }

    const updatedUser = await updateUser(req.userId, {
      adminName,
      username,
      password,
    });

    res.json({
      message: "Profile updated successfully",
      user: {
        id: updatedUser._id,
        username: updatedUser.username,
        adminName: updatedUser.adminName,
      },
    });
  } catch (err) {
    console.error("Error updating profile:", err);

    if (err.code === 11000) {
      return res.status(400).json({ error: "Username already exists" });
    }

    res.status(500).json({ error: "Failed to update profile" });
  }
}

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
};
